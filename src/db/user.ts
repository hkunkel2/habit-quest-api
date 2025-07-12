import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

export async function ensureDbConnected() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

export async function createUser(email: string, username: string, hashedPassword: string): Promise<User> {
  await ensureDbConnected();
  const repo = AppDataSource.getRepository(User);
  const user = repo.create({ email, username, password: hashedPassword });
  return await repo.save(user);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await ensureDbConnected();
  const repo = AppDataSource.getRepository(User);
  return await repo.findOneBy({ email });
}

export async function findUserByUsername(username: string): Promise<User | null> {
  await ensureDbConnected();
  const repo = AppDataSource.getRepository(User);
  return await repo.findOneBy({ username });
}

export async function getUsers(search?: string): Promise<User[]> {
  await ensureDbConnected();
  const repo = AppDataSource.getRepository(User);

  const qb = repo.createQueryBuilder('user');

  if (search) {
    qb.where('user.email ILIKE :search OR user.username ILIKE :search', {
      search: `%${search}%`,
    });
  }

  return await qb.orderBy('user.createdAt', 'DESC').getMany();
}

