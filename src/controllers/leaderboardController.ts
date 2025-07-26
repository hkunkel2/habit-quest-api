import { Request, Response } from 'express';
import * as leaderboardDB from '../db/leaderboard';
import * as categoryDB from '../db/category';
import { leaderboardQuerySchema } from '../validators/leaderboardValidators';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const queryParams = leaderboardQuerySchema.parse(req.query);
    const { type, categoryId, limit } = queryParams;

    if (categoryId) {
      const category = await categoryDB.findCategoryById(categoryId);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
    }

    let leaderboardData;
    let leaderboardType: string;

    switch (type) {
      case 'streak-by-category':
        if (!categoryId) {
          res.status(400).json({ error: 'categoryId is required for streak-by-category leaderboard' });
          return;
        }
        leaderboardData = await leaderboardDB.getTopStreaksByCategory(categoryId, limit);
        leaderboardType = 'Streak by Category';
        break;

      case 'streak-by-user':
        leaderboardData = await leaderboardDB.getTopStreaksByUser(limit);
        leaderboardType = 'Streak by User';
        break;

      case 'level-by-category':
        if (!categoryId) {
          res.status(400).json({ error: 'categoryId is required for level-by-category leaderboard' });
          return;
        }
        leaderboardData = await leaderboardDB.getTopLevelsByCategory(categoryId, limit);
        leaderboardType = 'Level by Category';
        break;

      case 'level-by-user':
        leaderboardData = await leaderboardDB.getTopLevelsByUser(limit);
        leaderboardType = 'Level by User';
        break;

      default:
        res.status(400).json({ error: 'Invalid leaderboard type' });
        return;
    }

    res.status(200).json({
      type: leaderboardType,
      leaderboardType: type,
      categoryId: categoryId || null,
      limit,
      entries: leaderboardData,
      count: leaderboardData.length,
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
      console.error('Leaderboard controller error:', error);
      res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};