import { AppDataSource } from '../data-source';
import { Streak } from '../entities/Streak';
import { UserCategoryExperience } from '../entities/UserCategoryExperience';
import { ensureDbConnected } from './index';
import { ExperienceCalculator } from '../services/ExperienceCalculator';

const streakRepository = AppDataSource.getRepository(Streak);
const userCategoryExperienceRepo = AppDataSource.getRepository(UserCategoryExperience);

export interface StreakLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  habitId: string;
  habitName: string;
  categoryId: string;
  categoryName: string;
  streakCount: number;
  isActive: boolean;
}

export interface UserStreakLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  streakCount: number;
  topStreakHabit: {
    habitId: string;
    habitName: string;
    categoryId: string;
    categoryName: string;
  } | null;
  isActive: boolean;
}

export interface CategoryLevelLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  categoryId: string;
  categoryName: string;
  totalExperience: number;
  level: number;
}

export interface UserLevelLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalExperience: number;
  totalLevel: number;
  categoriesCount: number;
  topCategory: {
    categoryId: string;
    categoryName: string;
    level: number;
    experience: number;
  } | null;
}

export async function getTopStreaksByCategory(
  categoryId: string,
  limit: number = 10
): Promise<StreakLeaderboardEntry[]> {
  await ensureDbConnected();
  
  try {
    // Use query builder with explicit joins for better reliability
    const result = await streakRepository
      .createQueryBuilder('streak')
      .innerJoinAndSelect('streak.user', 'user')
      .innerJoinAndSelect('streak.habit', 'habit')
      .innerJoinAndSelect('habit.category', 'category')
      .where('habit.categoryId = :categoryId', { categoryId })
      .andWhere('streak.count > :minCount', { minCount: 0 })
      .orderBy('streak.count', 'DESC')
      .addOrderBy('streak.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return result.map((streak, index) => ({
      rank: index + 1,
      userId: streak.user.id,
      username: streak.user.username,
      habitId: streak.habit.id,
      habitName: streak.habit.name,
      categoryId: streak.habit.category.id,
      categoryName: streak.habit.category.name,
      streakCount: streak.count,
      isActive: streak.isActive,
    }));
  } catch (error) {
    console.error('Error in getTopStreaksByCategory:', error);
    return [];
  }
}

export async function getTopStreaksByUser(
  limit: number = 10
): Promise<UserStreakLeaderboardEntry[]> {
  await ensureDbConnected();
  
  try {
    const result = await streakRepository
      .createQueryBuilder('streak')
      .innerJoinAndSelect('streak.user', 'user')
      .innerJoinAndSelect('streak.habit', 'habit')
      .innerJoinAndSelect('habit.category', 'category')
      .where('streak.count > :minCount', { minCount: 0 })
      .orderBy('streak.count', 'DESC')
      .addOrderBy('streak.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return result.map((streak, index) => ({
      rank: index + 1,
      userId: streak.user.id,
      username: streak.user.username,
      streakCount: streak.count,
      topStreakHabit: {
        habitId: streak.habit.id,
        habitName: streak.habit.name,
        categoryId: streak.habit.category.id,
        categoryName: streak.habit.category.name,
      },
      isActive: streak.isActive,
    }));
  } catch (error) {
    console.error('Error in getTopStreaksByUser:', error);
    return [];
  }
}

export async function getTopLevelsByCategory(
  categoryId: string,
  limit: number = 10
): Promise<CategoryLevelLeaderboardEntry[]> {
  await ensureDbConnected();
  
  const result = await userCategoryExperienceRepo
    .createQueryBuilder('uce')
    .leftJoinAndSelect('uce.user', 'user')
    .leftJoinAndSelect('uce.category', 'category')
    .where('uce.categoryId = :categoryId', { categoryId })
    .orderBy('uce.totalExperience', 'DESC')
    .limit(limit)
    .getMany();

  const experienceCalculator = new ExperienceCalculator();

  return result.map((uce, index) => {
    const levelInfo = experienceCalculator.calculateLevelInfo(uce.totalExperience);
    
    return {
      rank: index + 1,
      userId: uce.userId,
      username: uce.user.username,
      categoryId: uce.categoryId,
      categoryName: uce.category.name,
      totalExperience: uce.totalExperience,
      level: levelInfo.currentLevel,
    };
  });
}

export async function getTopLevelsByUser(
  limit: number = 10
): Promise<UserLevelLeaderboardEntry[]> {
  await ensureDbConnected();
  
  const result = await userCategoryExperienceRepo
    .createQueryBuilder('uce')
    .leftJoinAndSelect('uce.user', 'user')
    .select([
      'uce.userId as "userId"',
      'user.username as username',
      'SUM(uce.totalExperience) as "totalExperience"',
      'COUNT(uce.categoryId) as "categoriesCount"'
    ])
    .groupBy('uce.userId, user.username')
    .orderBy('SUM(uce.totalExperience)', 'DESC')
    .limit(limit)
    .getRawMany();

  const experienceCalculator = new ExperienceCalculator();

  const userLevelPromises = result.map(async (row) => {
    const categoryExperiences = await userCategoryExperienceRepo.find({
      where: { userId: row.userId },
      relations: ['category'],
      order: { totalExperience: 'DESC' },
    });

    const categoryExpData = categoryExperiences.map(ce => ({
      categoryId: ce.categoryId,
      totalExperience: ce.totalExperience,
    }));

    const userLevelInfo = experienceCalculator.calculateUserLevel(categoryExpData);

    const topCategoryExp = categoryExperiences[0];
    const topCategory = topCategoryExp ? {
      categoryId: topCategoryExp.categoryId,
      categoryName: topCategoryExp.category.name,
      level: experienceCalculator.calculateLevelInfo(topCategoryExp.totalExperience).currentLevel,
      experience: topCategoryExp.totalExperience,
    } : null;

    return {
      rank: 0,
      userId: row.userId,
      username: row.username,
      totalExperience: Number(row.totalExperience),
      totalLevel: userLevelInfo.totalLevel,
      categoriesCount: Number(row.categoriesCount),
      topCategory,
    };
  });

  const results = await Promise.all(userLevelPromises);
  
  results.sort((a, b) => {
    if (b.totalLevel !== a.totalLevel) {
      return b.totalLevel - a.totalLevel;
    }
    return b.totalExperience - a.totalExperience;
  });

  return results.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}