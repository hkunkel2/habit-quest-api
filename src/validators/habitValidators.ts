import { z } from 'zod';

export const HabitStatusEnum = z.enum(['Active', 'Draft', 'Completed', 'Cancelled', 'Deleted']);

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  status: HabitStatusEnum.default('Draft'),
});

export const updateHabitSchema = z.object({
  id: z.string().uuid(),
  body: z.object({
    name: z.string().optional(),
    status: HabitStatusEnum.optional(),
    categoryId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  }),
});