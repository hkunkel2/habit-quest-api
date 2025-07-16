import { AppDataSource } from '../data-source';
import { UserRelationship, RelationshipType } from '../entities/UserRelationship';
import { ensureDbConnected } from './index';

const userRelationshipRepo = AppDataSource.getRepository(UserRelationship);

export async function sendFriendRequest(userId: string, targetUserId: string): Promise<UserRelationship> {
  await ensureDbConnected();
  
  const existingRelation = await userRelationshipRepo.findOneBy({
    userId,
    targetUserId
  });
  
  if (existingRelation) {
    throw new Error('Relationship already exists');
  }
  
  const friendRequest = userRelationshipRepo.create({
    userId,
    targetUserId,
    type: RelationshipType.PENDING
  });
  
  return await userRelationshipRepo.save(friendRequest);
}

export async function acceptFriendRequest(userId: string, requesterId: string): Promise<UserRelationship> {
  await ensureDbConnected();
  
  const friendRequest = await userRelationshipRepo.findOneBy({
    userId: requesterId,
    targetUserId: userId,
    type: RelationshipType.PENDING
  });
  
  if (!friendRequest) {
    throw new Error('Friend request not found');
  }
  
  friendRequest.type = RelationshipType.FRIEND;
  return await userRelationshipRepo.save(friendRequest);
}

export async function denyFriendRequest(userId: string, requesterId: string): Promise<void> {
  await ensureDbConnected();
  
  const result = await userRelationshipRepo.delete({
    userId: requesterId,
    targetUserId: userId,
    type: RelationshipType.PENDING
  });
  
  if (result.affected === 0) {
    throw new Error('Friend request not found');
  }
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  await ensureDbConnected();
  
  await userRelationshipRepo.delete({
    userId,
    targetUserId: friendId,
    type: RelationshipType.FRIEND
  });
  
  await userRelationshipRepo.delete({
    userId: friendId,
    targetUserId: userId,
    type: RelationshipType.FRIEND
  });
}

export async function blockUser(userId: string, targetUserId: string): Promise<UserRelationship> {
  await ensureDbConnected();
  
  await userRelationshipRepo.delete({
    userId,
    targetUserId
  });
  
  await userRelationshipRepo.delete({
    userId: targetUserId,
    targetUserId: userId
  });
  
  const blockRelation = userRelationshipRepo.create({
    userId,
    targetUserId,
    type: RelationshipType.BLOCKED
  });
  
  return await userRelationshipRepo.save(blockRelation);
}

export async function getFriends(userId: string): Promise<UserRelationship[]> {
  await ensureDbConnected();
  
  return await userRelationshipRepo.find({
    where: [
      { userId, type: RelationshipType.FRIEND },
      { targetUserId: userId, type: RelationshipType.FRIEND }
    ],
    relations: ['user', 'targetUser']
  });
}

export async function getPendingFriendRequests(userId: string): Promise<UserRelationship[]> {
  await ensureDbConnected();
  
  return await userRelationshipRepo.find({
    where: {
      targetUserId: userId,
      type: RelationshipType.PENDING
    },
    relations: ['user']
  });
}

export async function getSentFriendRequests(userId: string): Promise<UserRelationship[]> {
  await ensureDbConnected();
  
  return await userRelationshipRepo.find({
    where: {
      userId,
      type: RelationshipType.PENDING
    },
    relations: ['targetUser']
  });
}

export async function acceptFriendRequestById(userRelationshipId: string): Promise<UserRelationship> {
  await ensureDbConnected();
  
  const relationship = await userRelationshipRepo.findOne({
    where: { id: userRelationshipId, type: RelationshipType.PENDING }
  });
  
  if (!relationship) {
    throw new Error('Friend request not found');
  }
  
  relationship.type = RelationshipType.FRIEND;
  return await userRelationshipRepo.save(relationship);
}

export async function removeUserRelationshipById(userRelationshipId: string): Promise<{ message: string }> {
  await ensureDbConnected();
  
  const relationship = await userRelationshipRepo.findOne({
    where: { id: userRelationshipId }
  });
  
  if (!relationship) {
    throw new Error('Relationship not found');
  }
  
  if (relationship.type === RelationshipType.FRIEND) {
    await userRelationshipRepo.delete({
      userId: relationship.targetUserId,
      targetUserId: relationship.userId,
      type: RelationshipType.FRIEND
    });
  }
  
  await userRelationshipRepo.delete({ id: userRelationshipId });
  
  let message: string;
  switch (relationship.type) {
    case RelationshipType.PENDING:
      message = 'Friend request denied';
      break;
    case RelationshipType.FRIEND:
      message = 'Friend removed';
      break;
    case RelationshipType.BLOCKED:
      message = 'User unblocked';
      break;
    default:
      message = 'Relationship removed';
  }
    
  return { message };
}