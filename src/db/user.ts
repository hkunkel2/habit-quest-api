import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
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

export async function getUsers(search?: string): Promise<User[]> {
  await ensureDbConnected();

  const qb = userRepo.createQueryBuilder('user');

  if (search) {
    qb.where('user.email ILIKE :search OR user.username ILIKE :search', {
      search: `%${search}%`,
    });
  }

  return await qb.orderBy('user.createdAt', 'DESC').getMany();
}

export async function findUserById(id: string): Promise<User | null> {
  await ensureDbConnected();
  return await userRepo.findOneBy({ id });
}

