import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  getFriends,
  getPendingFriendRequests,
  getSentFriendRequests
} from '../controllers/friendController';

const router = Router();

router.post('/request', sendFriendRequest);
router.patch('/:userRelationshipId/accept', acceptFriendRequest);
router.delete('/:userRelationshipId', removeFriend);
router.post('/block', blockUser);
router.get('/:userId', getFriends);
router.get('/:userId/requests/pending', getPendingFriendRequests);
router.get('/:userId/requests/sent', getSentFriendRequests);

export default router;