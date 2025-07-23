import { AppDataSource } from '../data-source';
import { User, Theme } from '../entities/User';
import { ensureDbConnected } from './index';

const userRepo = AppDataSource.getRepository(User);

export async function createUser(email: string, username: string, hashedPassword: string): Promise<User> {
  await ensureDbConnected();
  const user = userRepo.create({ email, username, password: hashedPassword });
  return await userRepo.save(user);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await ensureDbConnected();
  return await userRepo.findOneBy({ email });
}

export async function findUserByUsername(username: string): Promise<User | null> {
  await ensureDbConnected();
  return await userRepo.findOneBy({ username });
}

export async function getUsers(search?: string, friendsOnly?: boolean, userId?: string): Promise<User[]> {
  await ensureDbConnected();

  const qb = userRepo.createQueryBuilder('user');

  if (friendsOnly && userId) {
    qb.innerJoin(
      'user_relationship',
      'ur',
      '(ur.user_id = :userId AND ur.target_user_id = user.id AND ur.type = :friendType) OR (ur.target_user_id = :userId AND ur.user_id = user.id AND ur.type = :friendType)',
      { userId, friendType: 'FRIEND' }
    );
  }

  if (search) {
    qb.andWhere('user.email ILIKE :search OR user.username ILIKE :search', {
      search: `%${search}%`,
    });
  }

  return await qb.orderBy('user.createdAt', 'DESC').getMany();
}

export async function findUserById(id: string): Promise<User | null> {
  await ensureDbConnected();
  return await userRepo.findOneBy({ id });
}

export async function updateUser(id: string, updates: { username?: string; theme?: Theme }): Promise<User | null> {
  await ensureDbConnected();
  const user = await userRepo.findOneBy({ id });
  if (!user) {
    return null;
  }
  
  if (updates.username !== undefined) {
    user.username = updates.username;
  }
  if (updates.theme !== undefined) {
    user.theme = updates.theme;
  }
  
  return await userRepo.save(user);
}

