import { z } from 'zod';

export const HabitStatusEnum = z.enum(['Active', 'Draft', 'Completed', 'Cancelled', 'Deleted']);

export const createHabitSchema = z
  .object({
    name: z.string().min(1, 'Habit name is required'),
    startDate: z.coerce.date().optional(),
    userId: z.string().uuid(),
    categoryId: z.string().uuid(),
    status: HabitStatusEnum.default('Draft'),
  })
  .refine(
    (data) => {
      return data.status === 'Draft' || data.startDate instanceof Date;
    },
    {
      message: 'Start date is required unless status is Draft',
      path: ['startDate'],
    }
  );

  export const updateHabitSchema = z
  .object({
    id: z.string().uuid(),
    body: z.object({
      name: z.string().optional(),
      startDate: z.coerce.date().optional(),
      status: HabitStatusEnum.optional(),
      categoryId: z.string().uuid().optional(),
      userId: z.string().uuid().optional(),
    }),
  })
  .refine(
    ({ body }) => {
      return (
        !body.status || body.status === 'Draft' || body.startDate instanceof Date
      );
    },
    {
      message: 'Start date is required if status is not Draft',
      path: ['body', 'startDate'],
    }
  );