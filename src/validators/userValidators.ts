import { z } from 'zod';
import { Theme } from '../entities/User';

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

export const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
  theme: z.nativeEnum(Theme, {
    errorMap: () => ({ message: 'Theme must be either LIGHT or DARK' }),
  }).optional(),
}).refine((data) => data.username !== undefined || data.theme !== undefined, {
  message: 'At least one field (username or theme) must be provided',
});