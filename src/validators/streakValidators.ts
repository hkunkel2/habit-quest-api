import { z } from 'zod';

export const userHabitStatusSchema = z.object({
  userId: z.string().uuid('Invalid user ID format. Must be a valid UUID.'),
  habitId: z.string().uuid('Invalid habit ID format. Must be a valid UUID.').optional(),
});

export const habitTaskCompleteSchema = z.object({
  habitId: z.string().uuid('Invalid habit ID format. Must be a valid UUID.'),
});