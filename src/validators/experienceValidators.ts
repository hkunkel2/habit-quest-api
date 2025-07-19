import { z } from 'zod';

export const userIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const categoryIdSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format'),
});

export const experienceHistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  categoryId: z.string().uuid().optional(),
});

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

export const experienceConfigSchema = z.object({
  baseExperiencePoints: z.number().min(1),
  streakMultiplier: z.number().min(0),
  maxLevelCap: z.number().min(1),
  levelExperienceBase: z.number().min(1),
  levelExperienceMultiplier: z.number().min(1),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.startDate <= data.endDate, {
  message: 'Start date must be before or equal to end date',
});