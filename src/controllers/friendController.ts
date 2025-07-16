import { Request, Response } from 'express';
import * as userRelationshipDB from '../db/userRelationship';
import { 
  sendFriendRequestSchema, 
  respondToFriendRequestSchema, 
  blockUserSchema,
  userRelationshipIdSchema,
  userIdSchema
} from '../validators/userRelationshipValidators';

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { userId, targetUserId } = sendFriendRequestSchema.parse(req.body);

    if (userId === targetUserId) {
      res.status(400).json({ error: 'Cannot send friend request to yourself' });
    return;
    }

    const friendRequest = await userRelationshipDB.sendFriendRequest(userId, targetUserId);
    res.status(201).json({ message: 'Friend request sent', friendRequest });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { userRelationshipId } = userRelationshipIdSchema.parse({
      userRelationshipId: req.params.userRelationshipId
    });

    const friendship = await userRelationshipDB.acceptFriendRequestById(userRelationshipId);
    res.status(200).json({ message: 'Friend request accepted', friendship });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};


export const removeFriend = async (req: Request, res: Response) => {
  try {
    const { userRelationshipId } = userRelationshipIdSchema.parse({
      userRelationshipId: req.params.userRelationshipId
    });

    const result = await userRelationshipDB.removeUserRelationshipById(userRelationshipId);
    res.status(200).json({ message: result.message });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { userId, targetUserId } = blockUserSchema.parse(req.body);

    if (userId === targetUserId) {
      res.status(400).json({ error: 'Cannot block yourself' });
    return;
    }

    const blockRelation = await userRelationshipDB.blockUser(userId, targetUserId);
    res.status(200).json({ message: 'User blocked', blockRelation });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({
      userId: req.params.userId
    });

    const friends = await userRelationshipDB.getFriends(userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPendingFriendRequests = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({
      userId: req.params.userId
    });

    const pendingRequests = await userRelationshipDB.getPendingFriendRequests(userId);
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSentFriendRequests = async (req: Request, res: Response) => {
  try {
    const { userId } = userIdSchema.parse({
      userId: req.params.userId
    });

    const sentRequests = await userRelationshipDB.getSentFriendRequests(userId);
    res.status(200).json(sentRequests);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};