import request from 'supertest';
import express from 'express';
import * as experienceController from '../controllers/experienceController';
import * as userDB from '../db/user';
import * as userCategoryExperienceDB from '../db/userCategoryExperience';
import * as experienceTransactionDB from '../db/experienceTransaction';
import { ExperienceCalculator } from '../services/ExperienceCalculator';

jest.mock('../db/user');
jest.mock('../db/userCategoryExperience');
jest.mock('../db/experienceTransaction');
jest.mock('../services/ExperienceCalculator');

const app = express();
app.use(express.json());

app.get('/users/:userId/levels', experienceController.getUserLevels);
app.get('/users/:userId/experience', experienceController.getUserExperience);
app.get('/users/:userId/experience/history', experienceController.getUserExperienceHistory);
app.get('/users/:userId/categories/:categoryId/stats', experienceController.getCategoryStats);

const mockUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'test@example.com',
  username: 'testuser'
};

const mockCategoryExperiences = [
  { categoryId: 'cat1', categoryName: 'Fitness', totalExperience: 150 },
  { categoryId: 'cat2', categoryName: 'Learning', totalExperience: 300 }
];

const mockExperienceCalculator = {
  calculateUserLevel: jest.fn(),
  calculateLevelInfo: jest.fn(),
} as any;

beforeEach(() => {
  jest.clearAllMocks();
  (ExperienceCalculator as jest.MockedClass<typeof ExperienceCalculator>).mockImplementation(() => mockExperienceCalculator);
});

describe('Experience Controller', () => {
  describe('GET /users/:userId/levels', () => {
    it('should return user levels successfully', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (userCategoryExperienceDB.getUserExperienceByCategory as jest.Mock).mockResolvedValue(mockCategoryExperiences);
      
      mockExperienceCalculator.calculateUserLevel.mockReturnValue({
        totalLevel: 5,
        totalExperience: 450,
        categoryLevels: [
          { categoryId: 'cat1', level: 2, experience: 150 },
          { categoryId: 'cat2', level: 3, experience: 300 }
        ]
      });

      mockExperienceCalculator.calculateLevelInfo
        .mockReturnValueOnce({
          currentLevel: 2,
          experienceToNextLevel: 100,
          progress: 0.5
        })
        .mockReturnValueOnce({
          currentLevel: 3,
          experienceToNextLevel: 200,
          progress: 0.75
        });

      const response = await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/levels')
        .expect(200);

      expect(response.body).toEqual({
        userId: mockUser.id,
        username: mockUser.username,
        totalLevel: 5,
        totalExperience: 450,
        categoryLevels: [
          {
            categoryId: 'cat1',
            categoryName: 'Fitness',
            level: 2,
            experience: 150,
            experienceToNextLevel: 100,
            progress: 0.5
          },
          {
            categoryId: 'cat2',
            categoryName: 'Learning',
            level: 3,
            experience: 300,
            experienceToNextLevel: 200,
            progress: 0.75
          }
        ]
      });
    });

    it('should return 404 when user not found', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/levels')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/users/invalid-id/levels')
        .expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
    });
  });

  describe('GET /users/:userId/experience', () => {
    it('should return user experience successfully', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (userCategoryExperienceDB.getUserExperienceByCategory as jest.Mock).mockResolvedValue(mockCategoryExperiences);
      (userCategoryExperienceDB.getTotalUserExperience as jest.Mock).mockResolvedValue(450);
      (experienceTransactionDB.getTotalExperienceGainedToday as jest.Mock).mockResolvedValue(25);

      const response = await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/experience')
        .expect(200);

      expect(response.body).toEqual({
        userId: mockUser.id,
        username: mockUser.username,
        totalExperience: 450,
        todayExperience: 25,
        categoryBreakdown: mockCategoryExperiences
      });
    });
  });

  describe('GET /users/:userId/experience/history', () => {
    it('should return user experience history successfully', async () => {
      const mockTransactions = [
        {
          id: 'trans1',
          type: 'HABIT_COMPLETION',
          experienceGained: 15,
          category: { id: 'cat1', name: 'Fitness' },
          habitTask: { habit: { id: 'habit1', name: 'Push-ups' } },
          streakCount: 5,
          multiplier: 1.5,
          description: 'Completed habit: Push-ups (Streak: 5)',
          createdAt: '2025-07-19T10:00:00.000Z'
        }
      ];

      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (experienceTransactionDB.getUserExperienceHistory as jest.Mock).mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/experience/history')
        .expect(200);

      expect(response.body).toEqual({
        userId: mockUser.id,
        transactions: [
          {
            id: 'trans1',
            type: 'HABIT_COMPLETION',
            experienceGained: 15,
            category: { id: 'cat1', name: 'Fitness' },
            habit: { id: 'habit1', name: 'Push-ups' },
            streakCount: 5,
            multiplier: 1.5,
            description: 'Completed habit: Push-ups (Streak: 5)',
            createdAt: '2025-07-19T10:00:00.000Z'
          }
        ],
        pagination: {
          limit: 50,
          offset: 0,
          count: 1
        }
      });
    });

    it('should handle pagination parameters', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (experienceTransactionDB.getUserExperienceHistory as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/experience/history?limit=10&offset=20')
        .expect(200);

      expect(experienceTransactionDB.getUserExperienceHistory).toHaveBeenCalledWith(
        mockUser.id,
        10,
        20
      );
    });

    it('should filter by category when provided', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (experienceTransactionDB.getUserExperienceHistoryByCategory as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/experience/history?categoryId=cat1')
        .expect(200);

      expect(experienceTransactionDB.getUserExperienceHistoryByCategory).toHaveBeenCalledWith(
        mockUser.id,
        'cat1',
        50,
        0
      );
    });
  });

  describe('GET /users/:userId/categories/:categoryId/stats', () => {
    it('should return category stats successfully', async () => {
      const mockUserCategoryExp = {
        category: { id: 'cat1', name: 'Fitness' },
        totalExperience: 300
      };

      const mockStats = {
        totalExperience: 300,
        totalTransactions: 20,
        averageExperience: 15,
        maxExperience: 25,
        minExperience: 10
      };

      const mockStreakStats = {
        highestStreakBonus: 15,
        averageStreakCount: 3.5,
        totalStreakBonuses: 10
      };

      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (userCategoryExperienceDB.getUserCategoryExperience as jest.Mock).mockResolvedValue(mockUserCategoryExp);
      (experienceTransactionDB.getExperienceStatsByCategory as jest.Mock).mockResolvedValue(mockStats);
      (experienceTransactionDB.getUserExperienceStreakStats as jest.Mock).mockResolvedValue(mockStreakStats);

      mockExperienceCalculator.calculateLevelInfo.mockReturnValue({
        currentLevel: 3,
        experienceToNextLevel: 200,
        progress: 0.6
      });

      const response = await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/categories/cat1/stats')
        .expect(200);

      expect(response.body).toEqual({
        userId: mockUser.id,
        category: { id: 'cat1', name: 'Fitness' },
        level: 3,
        experience: 300,
        experienceToNextLevel: 200,
        progress: 0.6,
        stats: {
          ...mockStats,
          streakStats: mockStreakStats
        }
      });
    });

    it('should return 400 when category ID is missing', async () => {
      const response = await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/categories//stats')
        .expect(404);
    });

    it('should return 404 when category experience not found', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (userCategoryExperienceDB.getUserCategoryExperience as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/users/11111111-1111-1111-1111-111111111111/categories/cat1/stats')
        .expect(404);

      expect(response.body.error).toBe('No experience found for this category');
    });
  });
});