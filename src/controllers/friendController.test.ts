import request from 'supertest';
import express from 'express';
import * as friendController from './friendController';
import * as userRelationshipDB from '../db/userRelationship';
import { RelationshipType } from '../entities/UserRelationship';

jest.mock('../db/userRelationship');

const app = express();
app.use(express.json());
app.post('/request', friendController.sendFriendRequest);
app.patch('/:userRelationshipId/accept', friendController.acceptFriendRequest);
app.delete('/:userRelationshipId', friendController.removeFriend);
app.post('/block', friendController.blockUser);
app.get('/:userId', friendController.getFriends);
app.get('/:userId/requests/pending', friendController.getPendingFriendRequests);
app.get('/:userId/requests/sent', friendController.getSentFriendRequests);

const USER1_ID = '550e8400-e29b-41d4-a716-446655440001';
const USER2_ID = '550e8400-e29b-41d4-a716-446655440002';
const RELATIONSHIP_ID = '550e8400-e29b-41d4-a716-446655440010';

describe('Friend Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      const mockFriendRequest = {
        id: '550e8400-e29b-41d4-a716-446655440010',
        userId: USER1_ID,
        targetUserId: USER2_ID,
        type: RelationshipType.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (userRelationshipDB.sendFriendRequest as jest.Mock).mockResolvedValue(mockFriendRequest);

      const response = await request(app)
        .post('/request')
        .send({
          userId: USER1_ID,
          targetUserId: USER2_ID
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Friend request sent');
      expect(response.body.friendRequest).toEqual(expect.objectContaining({
        id: mockFriendRequest.id,
        userId: mockFriendRequest.userId,
        targetUserId: mockFriendRequest.targetUserId,
        type: mockFriendRequest.type
      }));
      expect(userRelationshipDB.sendFriendRequest).toHaveBeenCalledWith(USER1_ID, USER2_ID);
    });

    it('should return 400 when trying to send friend request to yourself', async () => {
      const response = await request(app)
        .post('/request')
        .send({
          userId: USER1_ID,
          targetUserId: USER1_ID
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot send friend request to yourself');
      expect(userRelationshipDB.sendFriendRequest).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', async () => {
      const response = await request(app)
        .post('/request')
        .send({
          userId: 'invalid-uuid',
          targetUserId: USER2_ID
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when database operation fails', async () => {
      (userRelationshipDB.sendFriendRequest as jest.Mock).mockRejectedValue(new Error('Relationship already exists'));

      const response = await request(app)
        .post('/request')
        .send({
          userId: USER1_ID,
          targetUserId: USER2_ID
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Relationship already exists');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept a friend request successfully', async () => {
      const mockFriendship = {
        id: '550e8400-e29b-41d4-a716-446655440011',
        userId: USER1_ID,
        targetUserId: USER2_ID,
        type: RelationshipType.FRIEND,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (userRelationshipDB.acceptFriendRequestById as jest.Mock).mockResolvedValue(mockFriendship);

      const response = await request(app)
        .patch(`/${RELATIONSHIP_ID}/accept`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Friend request accepted');
      expect(response.body.friendship).toEqual(expect.objectContaining({
        id: mockFriendship.id,
        userId: mockFriendship.userId,
        targetUserId: mockFriendship.targetUserId,
        type: mockFriendship.type
      }));
      expect(userRelationshipDB.acceptFriendRequestById).toHaveBeenCalledWith(RELATIONSHIP_ID);
    });

    it('should return 400 when friend request not found', async () => {
      (userRelationshipDB.acceptFriendRequestById as jest.Mock).mockRejectedValue(new Error('Friend request not found'));

      const response = await request(app)
        .patch(`/${RELATIONSHIP_ID}/accept`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Friend request not found');
    });
  });


  describe('removeFriend', () => {
    it('should deny a friend request successfully', async () => {
      (userRelationshipDB.removeUserRelationshipById as jest.Mock).mockResolvedValue({
        message: 'Friend request denied'
      });

      const response = await request(app)
        .delete(`/${RELATIONSHIP_ID}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Friend request denied');
      expect(userRelationshipDB.removeUserRelationshipById).toHaveBeenCalledWith(RELATIONSHIP_ID);
    });

    it('should remove a friend successfully', async () => {
      (userRelationshipDB.removeUserRelationshipById as jest.Mock).mockResolvedValue({
        message: 'Friend removed'
      });

      const response = await request(app)
        .delete(`/${RELATIONSHIP_ID}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Friend removed');
      expect(userRelationshipDB.removeUserRelationshipById).toHaveBeenCalledWith(RELATIONSHIP_ID);
    });

    it('should unblock a user successfully', async () => {
      (userRelationshipDB.removeUserRelationshipById as jest.Mock).mockResolvedValue({
        message: 'User unblocked'
      });

      const response = await request(app)
        .delete(`/${RELATIONSHIP_ID}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User unblocked');
      expect(userRelationshipDB.removeUserRelationshipById).toHaveBeenCalledWith(RELATIONSHIP_ID);
    });

    it('should return 400 when relationship not found', async () => {
      (userRelationshipDB.removeUserRelationshipById as jest.Mock).mockRejectedValue(new Error('Relationship not found'));

      const response = await request(app)
        .delete(`/${RELATIONSHIP_ID}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Relationship not found');
    });

    it('should handle unknown relationship type gracefully', async () => {
      (userRelationshipDB.removeUserRelationshipById as jest.Mock).mockResolvedValue({
        message: 'Relationship removed'
      });

      const response = await request(app)
        .delete(`/${RELATIONSHIP_ID}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Relationship removed');
      expect(userRelationshipDB.removeUserRelationshipById).toHaveBeenCalledWith(RELATIONSHIP_ID);
    });

    it('should return 400 when userRelationshipId not found', async () => {
      (userRelationshipDB.removeUserRelationshipById as jest.Mock).mockRejectedValue(new Error('Relationship not found'));

      const response = await request(app)
        .delete('/550e8400-e29b-41d4-a716-446655440999')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Relationship not found');
    });

    it('should return 400 when userRelationshipId format is invalid', async () => {
      const response = await request(app)
        .delete('/invalid-uuid-format')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      // Zod validation error is returned as a string, not array in our controller
      expect(typeof response.body.error).toBe('string');
      expect(response.body.error).toContain('Invalid relationship ID format');
    });
  });

  describe('blockUser', () => {
    it('should block a user successfully', async () => {
      const mockBlockRelation = {
        id: '550e8400-e29b-41d4-a716-446655440012',
        userId: USER1_ID,
        targetUserId: USER2_ID,
        type: RelationshipType.BLOCKED,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (userRelationshipDB.blockUser as jest.Mock).mockResolvedValue(mockBlockRelation);

      const response = await request(app)
        .post('/block')
        .send({
          userId: USER1_ID,
          targetUserId: USER2_ID
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User blocked');
      expect(response.body.blockRelation).toEqual(expect.objectContaining({
        id: mockBlockRelation.id,
        userId: mockBlockRelation.userId,
        targetUserId: mockBlockRelation.targetUserId,
        type: mockBlockRelation.type
      }));
      expect(userRelationshipDB.blockUser).toHaveBeenCalledWith(USER1_ID, USER2_ID);
    });

    it('should return 400 when trying to block yourself', async () => {
      const response = await request(app)
        .post('/block')
        .send({
          userId: USER1_ID,
          targetUserId: USER1_ID
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot block yourself');
      expect(userRelationshipDB.blockUser).not.toHaveBeenCalled();
    });
  });

  describe('getFriends', () => {
    it('should get friends list successfully', async () => {
      const mockFriends = [
        {
          id: '550e8400-e29b-41d4-a716-446655440013',
          userId: USER1_ID,
          targetUserId: USER2_ID,
          type: RelationshipType.FRIEND,
          user: { id: USER1_ID, username: 'user1' },
          targetUser: { id: USER2_ID, username: 'user2' }
        }
      ];

      (userRelationshipDB.getFriends as jest.Mock).mockResolvedValue(mockFriends);

      const response = await request(app)
        .get(`/${USER1_ID}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFriends);
      expect(userRelationshipDB.getFriends).toHaveBeenCalledWith(USER1_ID);
    });

    it('should return 500 when database operation fails', async () => {
      (userRelationshipDB.getFriends as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/${USER1_ID}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('getPendingFriendRequests', () => {
    it('should get pending friend requests successfully', async () => {
      const mockRequests = [
        {
          id: '550e8400-e29b-41d4-a716-446655440014',
          userId: USER2_ID,
          targetUserId: USER1_ID,
          type: RelationshipType.PENDING,
          user: { id: USER2_ID, username: 'user2' }
        }
      ];

      (userRelationshipDB.getPendingFriendRequests as jest.Mock).mockResolvedValue(mockRequests);

      const response = await request(app)
        .get(`/${USER1_ID}/requests/pending`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRequests);
      expect(userRelationshipDB.getPendingFriendRequests).toHaveBeenCalledWith(USER1_ID);
    });
  });

  describe('getSentFriendRequests', () => {
    it('should get sent friend requests successfully', async () => {
      const mockRequests = [
        {
          id: '550e8400-e29b-41d4-a716-446655440015',
          userId: USER1_ID,
          targetUserId: USER2_ID,
          type: RelationshipType.PENDING,
          targetUser: { id: USER2_ID, username: 'user2' }
        }
      ];

      (userRelationshipDB.getSentFriendRequests as jest.Mock).mockResolvedValue(mockRequests);

      const response = await request(app)
        .get(`/${USER1_ID}/requests/sent`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRequests);
      expect(userRelationshipDB.getSentFriendRequests).toHaveBeenCalledWith(USER1_ID);
    });
  });
});