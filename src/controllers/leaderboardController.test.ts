import request from 'supertest';
import express from 'express';
import * as leaderboardController from '../controllers/leaderboardController';
import * as leaderboardDB from '../db/leaderboard';
import * as categoryDB from '../db/category';

jest.mock('../db/leaderboard');
jest.mock('../db/category');
jest.mock('../services/ExperienceCalculator');

const app = express();
app.use(express.json());

app.get('/leaderboards', leaderboardController.getLeaderboard);

const mockCategory = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Fitness',
};

const mockStreakByCategoryData = [
  {
    rank: 1,
    userId: 'user1',
    username: 'testuser1',
    habitId: 'habit1',
    habitName: 'Morning Run',
    categoryId: 'cat1',
    categoryName: 'Fitness',
    streakCount: 25,
    isActive: true,
  },
  {
    rank: 2,
    userId: 'user2',
    username: 'testuser2',
    habitId: 'habit2',
    habitName: 'Push ups',
    categoryId: 'cat1',
    categoryName: 'Fitness',
    streakCount: 20,
    isActive: false,
  },
];

const mockStreakByUserData = [
  {
    rank: 1,
    userId: 'user1',
    username: 'testuser1',
    streakCount: 30,
    topStreakHabit: {
      habitId: 'habit1',
      habitName: 'Morning Run',
      categoryId: 'cat1',
      categoryName: 'Fitness',
    },
    isActive: true,
  },
  {
    rank: 2,
    userId: 'user2',
    username: 'testuser2',
    streakCount: 25,
    topStreakHabit: {
      habitId: 'habit2',
      habitName: 'Reading',
      categoryId: 'cat2',
      categoryName: 'Learning',
    },
    isActive: false,
  },
];

const mockLevelByCategoryData = [
  {
    rank: 1,
    userId: 'user1',
    username: 'testuser1',
    categoryId: 'cat1',
    categoryName: 'Fitness',
    totalExperience: 2500,
    level: 5,
  },
  {
    rank: 2,
    userId: 'user2',
    username: 'testuser2',
    categoryId: 'cat1',
    categoryName: 'Fitness',
    totalExperience: 1800,
    level: 4,
  },
];

const mockLevelByUserData = [
  {
    rank: 1,
    userId: 'user1',
    username: 'testuser1',
    totalExperience: 5000,
    totalLevel: 7,
    categoriesCount: 3,
    topCategory: {
      categoryId: 'cat1',
      categoryName: 'Fitness',
      level: 4,
      experience: 2500,
    },
  },
  {
    rank: 2,
    userId: 'user2',
    username: 'testuser2',
    totalExperience: 3500,
    totalLevel: 5,
    categoriesCount: 2,
    topCategory: {
      categoryId: 'cat2',
      categoryName: 'Learning',
      level: 3,
      experience: 2000,
    },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Leaderboard Controller', () => {
  describe('GET /leaderboards?type=streak-by-category', () => {
    it('should return streak leaderboard by category successfully', async () => {
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(mockCategory);
      (leaderboardDB.getTopStreaksByCategory as jest.Mock).mockResolvedValue(mockStreakByCategoryData);

      const response = await request(app)
        .get('/leaderboards?type=streak-by-category&categoryId=11111111-1111-1111-1111-111111111111&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        type: 'Streak by Category',
        leaderboardType: 'streak-by-category',
        categoryId: '11111111-1111-1111-1111-111111111111',
        limit: 10,
        entries: mockStreakByCategoryData,
        count: 2,
      });

      expect(categoryDB.findCategoryById).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
      expect(leaderboardDB.getTopStreaksByCategory).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111', 10);
    });

    it('should return 404 when category not found', async () => {
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/leaderboards?type=streak-by-category&categoryId=11111111-1111-1111-1111-111111111111');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Category not found' });
    });

    it('should return 400 when categoryId is missing', async () => {
      const response = await request(app)
        .get('/leaderboards?type=streak-by-category');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request parameters');
    });
  });

  describe('GET /leaderboards?type=streak-by-user', () => {
    it('should return streak leaderboard by user successfully', async () => {
      (leaderboardDB.getTopStreaksByUser as jest.Mock).mockResolvedValue(mockStreakByUserData);

      const response = await request(app)
        .get('/leaderboards?type=streak-by-user&limit=5');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        type: 'Streak by User',
        leaderboardType: 'streak-by-user',
        categoryId: null,
        limit: 5,
        entries: mockStreakByUserData,
        count: 2,
      });

      expect(leaderboardDB.getTopStreaksByUser).toHaveBeenCalledWith(5);
    });

    it('should use default limit when not provided', async () => {
      (leaderboardDB.getTopStreaksByUser as jest.Mock).mockResolvedValue(mockStreakByUserData);

      const response = await request(app)
        .get('/leaderboards?type=streak-by-user');

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(10);
      expect(leaderboardDB.getTopStreaksByUser).toHaveBeenCalledWith(10);
    });
  });

  describe('GET /leaderboards?type=level-by-category', () => {
    it('should return level leaderboard by category successfully', async () => {
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(mockCategory);
      (leaderboardDB.getTopLevelsByCategory as jest.Mock).mockResolvedValue(mockLevelByCategoryData);

      const response = await request(app)
        .get('/leaderboards?type=level-by-category&categoryId=11111111-1111-1111-1111-111111111111&limit=15');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        type: 'Level by Category',
        leaderboardType: 'level-by-category',
        categoryId: '11111111-1111-1111-1111-111111111111',
        limit: 15,
        entries: mockLevelByCategoryData,
        count: 2,
      });

      expect(categoryDB.findCategoryById).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
      expect(leaderboardDB.getTopLevelsByCategory).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111', 15);
    });

    it('should return 400 when categoryId is missing', async () => {
      const response = await request(app)
        .get('/leaderboards?type=level-by-category');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request parameters');
    });
  });

  describe('GET /leaderboards?type=level-by-user', () => {
    it('should return level leaderboard by user successfully', async () => {
      (leaderboardDB.getTopLevelsByUser as jest.Mock).mockResolvedValue(mockLevelByUserData);

      const response = await request(app)
        .get('/leaderboards?type=level-by-user&limit=20');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        type: 'Level by User',
        leaderboardType: 'level-by-user',
        categoryId: null,
        limit: 20,
        entries: mockLevelByUserData,
        count: 2,
      });

      expect(leaderboardDB.getTopLevelsByUser).toHaveBeenCalledWith(20);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should return 400 for invalid leaderboard type', async () => {
      const response = await request(app)
        .get('/leaderboards?type=invalid-type');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request parameters');
    });

    it('should return 400 for invalid categoryId format', async () => {
      const response = await request(app)
        .get('/leaderboards?type=streak-by-category&categoryId=invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request parameters');
    });

    it('should return 400 for limit out of range', async () => {
      const response = await request(app)
        .get('/leaderboards?type=streak-by-user&limit=100');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request parameters');
    });

    it('should return 400 for negative limit', async () => {
      const response = await request(app)
        .get('/leaderboards?type=streak-by-user&limit=-5');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request parameters');
    });

    it('should handle database errors gracefully', async () => {
      (leaderboardDB.getTopStreaksByUser as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/leaderboards?type=streak-by-user');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database connection failed');
    });

    it('should handle category lookup errors gracefully', async () => {
      (categoryDB.findCategoryById as jest.Mock).mockRejectedValue(new Error('Category lookup failed'));

      const response = await request(app)
        .get('/leaderboards?type=streak-by-category&categoryId=11111111-1111-1111-1111-111111111111');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Category lookup failed');
    });
  });

  describe('Query Parameter Handling', () => {
    it('should handle string limit conversion', async () => {
      (leaderboardDB.getTopStreaksByUser as jest.Mock).mockResolvedValue(mockStreakByUserData);

      const response = await request(app)
        .get('/leaderboards?type=streak-by-user&limit=5');

      expect(response.status).toBe(200);
      expect(leaderboardDB.getTopStreaksByUser).toHaveBeenCalledWith(5);
    });

    it('should ignore categoryId for user-based leaderboards', async () => {
      (leaderboardDB.getTopStreaksByUser as jest.Mock).mockResolvedValue(mockStreakByUserData);

      const response = await request(app)
        .get('/leaderboards?type=streak-by-user&categoryId=11111111-1111-1111-1111-111111111111');

      expect(response.status).toBe(200);
      expect(response.body.categoryId).toBe(null);
      expect(categoryDB.findCategoryById).not.toHaveBeenCalled();
    });
  });

  describe('Leaderboard Data Validation', () => {
    it('should handle empty streak results gracefully', () => {
      (leaderboardDB.getTopStreaksByCategory as jest.Mock).mockResolvedValue([]);
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(mockCategory);

      return request(app)
        .get('/leaderboards?type=streak-by-category&categoryId=11111111-1111-1111-1111-111111111111')
        .expect(200)
        .then(response => {
          expect(response.body.entries).toEqual([]);
          expect(response.body.count).toBe(0);
        });
    });

    it('should handle empty user streak results gracefully', () => {
      (leaderboardDB.getTopStreaksByUser as jest.Mock).mockResolvedValue([]);

      return request(app)
        .get('/leaderboards?type=streak-by-user')
        .expect(200)
        .then(response => {
          expect(response.body.entries).toEqual([]);
          expect(response.body.count).toBe(0);
        });
    });

    it('should validate that mock data structure matches interface expectations', () => {
      // Test that our mock data structure matches what the real functions should return
      expect(mockStreakByCategoryData[0]).toHaveProperty('rank');
      expect(mockStreakByCategoryData[0]).toHaveProperty('userId');
      expect(mockStreakByCategoryData[0]).toHaveProperty('username');
      expect(mockStreakByCategoryData[0]).toHaveProperty('habitId');
      expect(mockStreakByCategoryData[0]).toHaveProperty('habitName');
      expect(mockStreakByCategoryData[0]).toHaveProperty('categoryId');
      expect(mockStreakByCategoryData[0]).toHaveProperty('categoryName');
      expect(mockStreakByCategoryData[0]).toHaveProperty('streakCount');
      expect(mockStreakByCategoryData[0]).toHaveProperty('isActive');

      expect(mockStreakByUserData[0]).toHaveProperty('rank');
      expect(mockStreakByUserData[0]).toHaveProperty('userId');
      expect(mockStreakByUserData[0]).toHaveProperty('username');
      expect(mockStreakByUserData[0]).toHaveProperty('streakCount');
      expect(mockStreakByUserData[0]).toHaveProperty('topStreakHabit');
      expect(mockStreakByUserData[0]).toHaveProperty('isActive');
      expect(mockStreakByUserData[0].topStreakHabit).toHaveProperty('habitId');
      expect(mockStreakByUserData[0].topStreakHabit).toHaveProperty('habitName');
      expect(mockStreakByUserData[0].topStreakHabit).toHaveProperty('categoryId');
      expect(mockStreakByUserData[0].topStreakHabit).toHaveProperty('categoryName');
    });
  });
});