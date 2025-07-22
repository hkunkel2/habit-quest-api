import request from 'supertest';
import express from 'express';
import * as userController from '../controllers/userController';
import * as userDB from '../db/user';
import * as habitDB from '../db/habit';
import * as userRelationshipDB from '../db/userRelationship';
import * as userCategoryExperienceDB from '../db/userCategoryExperience';
import * as experienceTransactionDB from '../db/experienceTransaction';
import bcrypt from 'bcryptjs';
import { generateToken } from '../auth/jwt';

jest.mock('../db/user');
jest.mock('../db/habit');
jest.mock('../db/userRelationship');
jest.mock('../db/userCategoryExperience');
jest.mock('../db/experienceTransaction');
jest.mock('../auth/jwt');
jest.mock('./streakController', () => ({
  processSingleHabitStatus: jest.fn(),
}));
jest.mock('../services/ExperienceCalculator', () => ({
  ExperienceCalculator: jest.fn().mockImplementation(() => ({
    calculateUserLevel: jest.fn().mockReturnValue({ totalLevel: 1, totalExperience: 0 }),
    calculateLevelInfo: jest.fn().mockReturnValue({ currentLevel: 1, experienceToNextLevel: 100, progress: 0 }),
  })),
}));
jest.mock('../services/habitSeedService', () => ({
  createPreSeededHabits: jest.fn(),
  DEFAULT_STUDENT_HABITS: [
    { name: 'Study for 30 minutes', categoryName: 'School' },
    { name: 'Get 8 hours of sleep', categoryName: 'Sleep' },
    { name: 'Exercise for 20 minutes', categoryName: 'Fitness' },
    { name: 'Read for 15 minutes', categoryName: 'Reading' },
    { name: 'Practice mindfulness for 5 minutes', categoryName: 'Mindfulness' }
  ]
}));

const app = express();
app.use(express.json());
app.post('/signup', userController.signUpUser);
app.post('/login', userController.loginUser);
app.post('/logout', userController.logoutUser);
app.get('/users', userController.getUsers);
app.patch('/:userId/update', userController.updateUser);

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (habitDB.getHabitsByUser as jest.Mock).mockResolvedValue([]);
    (userRelationshipDB.getFriends as jest.Mock).mockResolvedValue([]);
    (userRelationshipDB.getPendingFriendRequests as jest.Mock).mockResolvedValue([]);
    (userRelationshipDB.getSentFriendRequests as jest.Mock).mockResolvedValue([]);
    (userCategoryExperienceDB.getUserExperienceByCategory as jest.Mock).mockResolvedValue([]);
    (userCategoryExperienceDB.getTotalUserExperience as jest.Mock).mockResolvedValue(0);
    (experienceTransactionDB.getTotalExperienceGainedToday as jest.Mock).mockResolvedValue(0);
    
    const { processSingleHabitStatus } = require('./streakController');
    (processSingleHabitStatus as jest.Mock).mockResolvedValue({
      message: 'No habits to process',
      habitTask: null,
      currentStreak: null,
      allStreaks: [],
      created: false
    });
    
  });

  describe('signUpUser', () => {
    it('should sign up a user and return a token', async () => {
      const { createPreSeededHabits } = require('../services/habitSeedService');
      (userDB.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
      (userDB.findUserById as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
      (generateToken as jest.Mock).mockReturnValue('fakeToken');
      (createPreSeededHabits as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: 'Password123!', username: 'testuser' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe('fakeToken');
      expect(res.body.user).toBeDefined();
      expect(res.body.habits).toBeDefined();
      expect(res.body.levels).toBeDefined();
      expect(res.body.friends).toBeDefined();
      expect(res.body.experience).toBeDefined();
      expect(createPreSeededHabits).toHaveBeenCalledWith(1);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: '', password: '', username: '' });

      expect(res.status).toBe(400);
    });

    it('should still succeed if pre-seeded habits creation fails', async () => {
      const { createPreSeededHabits } = require('../services/habitSeedService');
      (userDB.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
      (userDB.findUserById as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
      (generateToken as jest.Mock).mockReturnValue('fakeToken');
      (createPreSeededHabits as jest.Mock).mockRejectedValue(new Error('Habit creation failed'));

      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: 'Password123!', username: 'testuser' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe('fakeToken');
      expect(createPreSeededHabits).toHaveBeenCalledWith(1);
    });

    it('should create user with pre-seeded habits in profile data', async () => {
      const { createPreSeededHabits } = require('../services/habitSeedService');
      const mockHabits = [
        { id: '1', name: 'Study for 30 minutes', status: 'Draft', category: { name: 'School' } },
        { id: '2', name: 'Get 8 hours of sleep', status: 'Draft', category: { name: 'Sleep' } },
        { id: '3', name: 'Exercise for 20 minutes', status: 'Draft', category: { name: 'Fitness' } },
        { id: '4', name: 'Read for 15 minutes', status: 'Draft', category: { name: 'Reading' } },
        { id: '5', name: 'Practice mindfulness for 5 minutes', status: 'Draft', category: { name: 'Mindfulness' } }
      ];
      
      (userDB.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
      (userDB.findUserById as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
      (habitDB.getHabitsByUser as jest.Mock).mockResolvedValue(mockHabits);
      (generateToken as jest.Mock).mockReturnValue('fakeToken');
      (createPreSeededHabits as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: 'Password123!', username: 'testuser' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe('fakeToken');
      expect(createPreSeededHabits).toHaveBeenCalledWith(1);
      expect(res.body.habits).toHaveLength(5);
      expect(res.body.habits[0].habitName).toBe('Study for 30 minutes');
      expect(res.body.habits[1].habitName).toBe('Get 8 hours of sleep');
      expect(res.body.habits[2].habitName).toBe('Exercise for 20 minutes');
      expect(res.body.habits[3].habitName).toBe('Read for 15 minutes');
      expect(res.body.habits[4].habitName).toBe('Practice mindfulness for 5 minutes');
    });
  });

  describe('loginUser', () => {
    it('should login using email', async () => {
      const hashed = await bcrypt.hash('Password123!', 10);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashed,
        username: 'testuser',
      };
      (userDB.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('fakeToken');

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('fakeToken');
      expect(res.body.user).toBeDefined();
      expect(res.body.habits).toBeDefined();
      expect(res.body.levels).toBeDefined();
      expect(res.body.friends).toBeDefined();
      expect(res.body.experience).toBeDefined();
    });

    it('should login using username', async () => {
      const hashed = await bcrypt.hash('Password123!', 10);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashed,
        username: 'testuser',
      };
      (userDB.findUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('fakeToken');

      const res = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('fakeToken');
      expect(res.body.user).toBeDefined();
      expect(res.body.habits).toBeDefined();
      expect(res.body.levels).toBeDefined();
      expect(res.body.friends).toBeDefined();
      expect(res.body.experience).toBeDefined();
    });

    it('should return 401 on invalid credentials', async () => {
      (userDB.findUserByEmail as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });
  });

  describe('logoutUser', () => {
    it('should logout the user', async () => {
      const res = await request(app).post('/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logout successful');
    });
  });

  describe('getUsers', () => {
    it('should return users when search query is provided', async () => {
      const mockUsers = [
        { id: 1, email: 'john@example.com', username: 'john', password: 'hashed' },
      ];
      (userDB.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      const res = await request(app).get('/users?search=john');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(userDB.getUsers).toHaveBeenCalledWith('john');
    });

    it('should return 500 if an error occurs', async () => {
      (userDB.getUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/users');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database error');
    });
  });

  describe('updateUser', () => {
    it('should update user theme successfully', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        theme: 'LIGHT'
      };
      const updatedUser = { ...mockUser, theme: 'DARK' };
      
      (userDB.updateUser as jest.Mock).mockResolvedValue(updatedUser);
      (userDB.findUserById as jest.Mock).mockResolvedValue(updatedUser);

      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({ theme: 'DARK' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User updated successfully');
      expect(res.body.user).toBeDefined();
      expect(userDB.updateUser).toHaveBeenCalledWith(mockUserId, { theme: 'DARK' });
    });

    it('should update username successfully', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        theme: 'LIGHT'
      };
      const updatedUser = { ...mockUser, username: 'newusername' };
      
      (userDB.findUserByUsername as jest.Mock).mockResolvedValue(null);
      (userDB.updateUser as jest.Mock).mockResolvedValue(updatedUser);
      (userDB.findUserById as jest.Mock).mockResolvedValue(updatedUser);

      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({ username: 'newusername' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User updated successfully');
      expect(userDB.findUserByUsername).toHaveBeenCalledWith('newusername');
      expect(userDB.updateUser).toHaveBeenCalledWith(mockUserId, { username: 'newusername' });
    });

    it('should update both username and theme successfully', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        theme: 'LIGHT'
      };
      const updatedUser = { ...mockUser, username: 'newusername', theme: 'DARK' };
      
      (userDB.findUserByUsername as jest.Mock).mockResolvedValue(null);
      (userDB.updateUser as jest.Mock).mockResolvedValue(updatedUser);
      (userDB.findUserById as jest.Mock).mockResolvedValue(updatedUser);

      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({ username: 'newusername', theme: 'DARK' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User updated successfully');
      expect(userDB.updateUser).toHaveBeenCalledWith(mockUserId, { username: 'newusername', theme: 'DARK' });
    });

    it('should return 400 if username already exists', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const existingUser = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'other@example.com',
        username: 'existinguser',
        theme: 'LIGHT'
      };
      
      (userDB.findUserByUsername as jest.Mock).mockResolvedValue(existingUser);

      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({ username: 'existinguser' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Username already exists');
    });

    it('should return 404 if user not found', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440002';
      (userDB.findUserByUsername as jest.Mock).mockResolvedValue(null);
      (userDB.updateUser as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({ theme: 'DARK' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 400 for invalid theme', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({ theme: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request data');
    });

    it('should return 400 for invalid username (too short)', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({ username: 'ab' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request data');
    });

    it('should return 400 if no fields provided', async () => {
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const res = await request(app)
        .patch(`/${mockUserId}/update`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request data');
    });
  });
});