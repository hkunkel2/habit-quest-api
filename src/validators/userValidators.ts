import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.email || data.username, {
  message: 'Either email or username must be provided',
});