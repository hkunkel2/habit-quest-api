import { Request, Response } from 'express';
import * as userDB from '../db/user';
import * as userCategoryExperienceDB from '../db/userCategoryExperience';
import * as experienceTransactionDB from '../db/experienceTransaction';
import { ExperienceCalculator } from '../services/ExperienceCalculator';
import { userIdSchema } from '../validators/experienceValidators';

export const getUserLevels = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({ userId: req.params.userId });

    const user = await userDB.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const categoryExperiences = await userCategoryExperienceDB.getUserExperienceByCategory(userId);
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

    res.status(200).json({
      userId,
      username: user.username,
      totalLevel: userLevelInfo.totalLevel,
      totalExperience: userLevelInfo.totalExperience,
      categoryLevels: categoryLevelDetails,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};

export const getUserExperience = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({ userId: req.params.userId });

    const user = await userDB.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const categoryExperiences = await userCategoryExperienceDB.getUserExperienceByCategory(userId);
    const totalExperience = await userCategoryExperienceDB.getTotalUserExperience(userId);
    const todayExperience = await experienceTransactionDB.getTotalExperienceGainedToday(userId);

    res.status(200).json({
      userId,
      username: user.username,
      totalExperience,
      todayExperience,
      categoryBreakdown: categoryExperiences,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};

export const getUserExperienceHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({ userId: req.params.userId });
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const categoryId = req.query.categoryId as string;

    const user = await userDB.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let transactions;
    if (categoryId) {
      transactions = await experienceTransactionDB.getUserExperienceHistoryByCategory(
        userId, 
        categoryId, 
        limit, 
        offset
      );
    } else {
      transactions = await experienceTransactionDB.getUserExperienceHistory(
        userId, 
        limit, 
        offset
      );
    }

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      experienceGained: transaction.experienceGained,
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
      },
      habit: transaction.habitTask ? {
        id: transaction.habitTask.habit.id,
        name: transaction.habitTask.habit.name,
      } : null,
      streakCount: transaction.streakCount,
      multiplier: transaction.multiplier,
      description: transaction.description,
      createdAt: transaction.createdAt,
    }));

    res.status(200).json({
      userId,
      transactions: formattedTransactions,
      pagination: {
        limit,
        offset,
        count: transactions.length,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};

export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({ userId: req.params.userId });
    const categoryId = req.params.categoryId;

    if (!categoryId) {
      res.status(400).json({ error: 'Category ID is required' });
      return;
    }

    const user = await userDB.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userCategoryExp = await userCategoryExperienceDB.getUserCategoryExperience(userId, categoryId);
    if (!userCategoryExp) {
      res.status(404).json({ error: 'No experience found for this category' });
      return;
    }

    const experienceCalculator = new ExperienceCalculator();
    const levelInfo = experienceCalculator.calculateLevelInfo(userCategoryExp.totalExperience);
    const stats = await experienceTransactionDB.getExperienceStatsByCategory(userId, categoryId);
    const streakStats = await experienceTransactionDB.getUserExperienceStreakStats(userId);

    res.status(200).json({
      userId,
      category: {
        id: userCategoryExp.category.id,
        name: userCategoryExp.category.name,
      },
      level: levelInfo.currentLevel,
      experience: userCategoryExp.totalExperience,
      experienceToNextLevel: levelInfo.experienceToNextLevel,
      progress: levelInfo.progress,
      stats: {
        ...stats,
        streakStats,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};