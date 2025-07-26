import { z } from 'zod';

export const leaderboardTypeEnum = z.enum([
  'streak-by-category',
  'streak-by-user', 
  'level-by-category',
  'level-by-user'
]);

export const leaderboardQuerySchema = z.object({
  type: leaderboardTypeEnum,
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
}).refine((data) => {
  if (data.type === 'streak-by-category' || data.type === 'level-by-category') {
    return data.categoryId !== undefined;
  }
  return true;
}, {
  message: 'categoryId is required for category-specific leaderboard types',
  path: ['categoryId']
}).transform((data) => {
  if (data.type === 'streak-by-user' || data.type === 'level-by-user') {
    return { ...data, categoryId: undefined };
  }
  return data;
});

export type LeaderboardType = z.infer<typeof leaderboardTypeEnum>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;