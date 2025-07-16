import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  targetUserId: z.string().uuid('Invalid user ID format'),
});

export const respondToFriendRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  requesterId: z.string().uuid('Invalid user ID format'),
});

export const userRelationshipIdSchema = z.object({
  userRelationshipId: z.string().uuid('Invalid relationship ID format'),
});

export const userIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const blockUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  targetUserId: z.string().uuid('Invalid user ID format'),
});