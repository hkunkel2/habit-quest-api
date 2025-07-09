// src/db/user.ts
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

