import { Request, Response } from 'express';
import * as userDB from '../db/user';
import * as habitDB from '../db/habit';
import * as userRelationshipDB from '../db/userRelationship';
import * as userCategoryExperienceDB from '../db/userCategoryExperience';
import * as experienceTransactionDB from '../db/experienceTransaction';
import { generateToken } from '../auth/jwt';
import bcrypt from 'bcryptjs';
import { loginSchema, signUpSchema } from '../validators/userValidators';
import { userIdSchema } from '../validators/experienceValidators';
import { ExperienceCalculator } from '../services/ExperienceCalculator';
import { processSingleHabitStatus } from './streakController';
import { createPreSeededHabits } from '../services/habitSeedService';

export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = signUpSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const user = await userDB.createUser(email!, username!, hashedPassword);
    const token = generateToken({ id: user.id, email: user.email });
    
    try {
      await createPreSeededHabits(user.id);
    } catch (habitError) {
      console.error('Failed to create pre-seeded habits:', habitError);
    }
    
    const profileData = await buildUserProfileData(user.id);
    
    res.status(201).json({ 
      message: 'User created', 
      token,
      ...profileData
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = loginSchema.parse(req.body);

    const user = email
      ? await userDB.findUserByEmail(email.trim())
      : await userDB.findUserByUsername(username!.trim());

    if (!user) throw new Error('Invalid credentials');
    if (!user.password) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password.trim(), user.password.trim());
    if (!isMatch) throw new Error('Invalid credentials');

    const token = generateToken({ id: user.id, email: user.email });
    
    const profileData = await buildUserProfileData(user.id);
    
    res.status(200).json({ 
      message: 'Login successful', 
      token,
      ...profileData
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const users = await userDB.getUsers(search);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const logoutUser = async (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logout successful' });
};

const buildUserProfileData = async (userId: string) => {
  const user = await userDB.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const userHabits = await habitDB.getHabitsByUser(userId);

  const habitsWithStatus = [];
  for (const habit of userHabits) {
    try {
      const habitStatus = await processSingleHabitStatus(userId, habit.id);
      habitsWithStatus.push({
        habitId: habit.id,
        habitName: habit.name,
        habitDetails: habit,
        ...habitStatus
      });
    } catch (error) {
      console.error(`Error processing habit ${habit.id}:`, error);
      habitsWithStatus.push({
        habitId: habit.id,
        habitName: habit.name,
        habitDetails: habit,
        message: 'Error processing habit status',
        habitTask: null,
        currentStreak: null,
        allStreaks: [],
        created: false
      });
    }
  }

  const [friends, pendingRequests, sentRequests, categoryExperiences, totalExperience, todayExperience] = await Promise.all([
    userRelationshipDB.getFriends(userId),
    userRelationshipDB.getPendingFriendRequests(userId),
    userRelationshipDB.getSentFriendRequests(userId),
    userCategoryExperienceDB.getUserExperienceByCategory(userId),
    userCategoryExperienceDB.getTotalUserExperience(userId),
    experienceTransactionDB.getTotalExperienceGainedToday(userId)
  ]);

  const experienceCalculator = new ExperienceCalculator();
  const userLevelInfo = experienceCalculator.calculateUserLevel(categoryExperiences);

  const categoryLevelDetails = categoryExperiences.map(catExp => {
    const levelInfo = experienceCalculator.calculateLevelInfo(catExp.totalExperience);
    return {
      categoryId: catExp.categoryId,
      categoryName: catExp.categoryName,
      level: levelInfo.currentLevel,
      experience: catExp.totalExperience,
      experienceToNextLevel: levelInfo.experienceToNextLevel,
      progress: levelInfo.progress,
    };
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    },
    habits: habitsWithStatus,
    levels: {
      totalLevel: userLevelInfo.totalLevel,
      totalExperience: userLevelInfo.totalExperience,
      categoryLevels: categoryLevelDetails
    },
    friends: {
      friends,
      pendingRequests,
      sentRequests
    },
    experience: {
      totalExperience,
      todayExperience,
      categoryBreakdown: categoryExperiences
    }
  };
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({ userId: req.params.userId });
    const profileData = await buildUserProfileData(userId);
    res.status(200).json(profileData);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};