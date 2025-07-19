import { AppDataSource } from '../data-source';
import { ExperienceTransaction, ExperienceTransactionType } from '../entities/ExperienceTransaction';
import { ensureDbConnected } from './index';

const experienceTransactionRepo = AppDataSource.getRepository(ExperienceTransaction);

export interface CreateExperienceTransactionParams {
  userId: string;
  categoryId: string;
  habitTaskId?: string;
  type: ExperienceTransactionType;
  experienceGained: number;
  streakCount?: number;
  multiplier?: number;
  description?: string;
}

export async function createExperienceTransaction(
  params: CreateExperienceTransactionParams
): Promise<ExperienceTransaction> {
  await ensureDbConnected();
  
  const transaction = experienceTransactionRepo.create({
    userId: params.userId,
    categoryId: params.categoryId,
    habitTaskId: params.habitTaskId,
    type: params.type,
    experienceGained: params.experienceGained,
    streakCount: params.streakCount,
    multiplier: params.multiplier,
    description: params.description,
  });
  
  return await experienceTransactionRepo.save(transaction);
}

export async function getUserExperienceHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ExperienceTransaction[]> {
  await ensureDbConnected();
  
  return await experienceTransactionRepo.find({
    where: { userId },
    relations: ['category', 'habitTask', 'habitTask.habit'],
    order: { createdAt: 'DESC' },
    take: limit,
    skip: offset,
  });
}

export async function getUserExperienceHistoryByCategory(
  userId: string,
  categoryId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ExperienceTransaction[]> {
  await ensureDbConnected();
  
  return await experienceTransactionRepo.find({
    where: { userId, categoryId },
    relations: ['category', 'habitTask', 'habitTask.habit'],
    order: { createdAt: 'DESC' },
    take: limit,
    skip: offset,
  });
}

export async function getTotalExperienceGainedToday(userId: string): Promise<number> {
  await ensureDbConnected();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await experienceTransactionRepo
    .createQueryBuilder('et')
    .select('SUM(et.experienceGained)', 'total')
    .where('et.userId = :userId', { userId })
    .andWhere('et.createdAt >= :today', { today })
    .andWhere('et.createdAt < :tomorrow', { tomorrow })
    .getRawOne();

  return Number(result?.total) || 0;
}

export async function getExperienceTransactionsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ExperienceTransaction[]> {
  await ensureDbConnected();
  
  return await experienceTransactionRepo.find({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      } as any,
    },
    relations: ['category', 'habitTask', 'habitTask.habit'],
    order: { createdAt: 'DESC' },
  });
}

export async function getExperienceStatsByCategory(
  userId: string,
  categoryId: string
): Promise<{
  totalExperience: number;
  totalTransactions: number;
  averageExperience: number;
  maxExperience: number;
  minExperience: number;
}> {
  await ensureDbConnected();
  
  const result = await experienceTransactionRepo
    .createQueryBuilder('et')
    .select([
      'SUM(et.experienceGained) as "totalExperience"',
      'COUNT(*) as "totalTransactions"',
      'AVG(et.experienceGained) as "averageExperience"',
      'MAX(et.experienceGained) as "maxExperience"',
      'MIN(et.experienceGained) as "minExperience"',
    ])
    .where('et.userId = :userId', { userId })
    .andWhere('et.categoryId = :categoryId', { categoryId })
    .getRawOne();

  return {
    totalExperience: Number(result?.totalExperience) || 0,
    totalTransactions: Number(result?.totalTransactions) || 0,
    averageExperience: Number(result?.averageExperience) || 0,
    maxExperience: Number(result?.maxExperience) || 0,
    minExperience: Number(result?.minExperience) || 0,
  };
}

export async function getUserExperienceStreakStats(userId: string): Promise<{
  highestStreakBonus: number;
  averageStreakCount: number;
  totalStreakBonuses: number;
}> {
  await ensureDbConnected();
  
  const result = await experienceTransactionRepo
    .createQueryBuilder('et')
    .select([
      'MAX(et.experienceGained - (et.experienceGained / et.multiplier)) as "highestStreakBonus"',
      'AVG(et.streakCount) as "averageStreakCount"',
      'COUNT(*) as "totalStreakBonuses"',
    ])
    .where('et.userId = :userId', { userId })
    .andWhere('et.streakCount IS NOT NULL')
    .andWhere('et.multiplier > 1')
    .getRawOne();

  return {
    highestStreakBonus: Number(result?.highestStreakBonus) || 0,
    averageStreakCount: Number(result?.averageStreakCount) || 0,
    totalStreakBonuses: Number(result?.totalStreakBonuses) || 0,
  };
}

export async function deleteExperienceTransaction(id: string): Promise<boolean> {
  await ensureDbConnected();
  
  const result = await experienceTransactionRepo.delete(id);
  return result.affected === 1;
}

export async function getExperienceTransactionById(id: string): Promise<ExperienceTransaction | null> {
  await ensureDbConnected();
  
  return await experienceTransactionRepo.findOne({
    where: { id },
    relations: ['category', 'habitTask', 'habitTask.habit', 'user'],
  });
}