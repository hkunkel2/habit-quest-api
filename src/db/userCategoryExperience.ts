import { AppDataSource } from '../data-source';
import { UserCategoryExperience } from '../entities/UserCategoryExperience';
import { ensureDbConnected } from './index';

const userCategoryExperienceRepo = AppDataSource.getRepository(UserCategoryExperience);

export async function findOrCreateUserCategoryExperience(
  userId: string,
  categoryId: string
): Promise<UserCategoryExperience> {
  await ensureDbConnected();
  
  let userCategoryExp = await userCategoryExperienceRepo.findOne({
    where: { userId, categoryId },
  });

  if (!userCategoryExp) {
    userCategoryExp = userCategoryExperienceRepo.create({
      userId,
      categoryId,
      totalExperience: 0,
    });
    await userCategoryExperienceRepo.save(userCategoryExp);
  }

  return userCategoryExp;
}

export async function addExperienceToCategory(
  userId: string,
  categoryId: string,
  experienceGained: number
): Promise<UserCategoryExperience> {
  await ensureDbConnected();
  
  const userCategoryExp = await findOrCreateUserCategoryExperience(userId, categoryId);
  userCategoryExp.totalExperience += experienceGained;
  
  return await userCategoryExperienceRepo.save(userCategoryExp);
}

export async function getUserCategoryExperience(
  userId: string,
  categoryId: string
): Promise<UserCategoryExperience | null> {
  await ensureDbConnected();
  
  return await userCategoryExperienceRepo.findOne({
    where: { userId, categoryId },
    relations: ['category'],
  });
}

export async function getAllUserCategoryExperiences(
  userId: string
): Promise<UserCategoryExperience[]> {
  await ensureDbConnected();
  
  return await userCategoryExperienceRepo.find({
    where: { userId },
    relations: ['category'],
    order: { totalExperience: 'DESC' },
  });
}

export async function getUserExperienceByCategory(
  userId: string
): Promise<{ categoryId: string; categoryName: string; totalExperience: number }[]> {
  await ensureDbConnected();
  
  const result = await userCategoryExperienceRepo
    .createQueryBuilder('uce')
    .leftJoinAndSelect('uce.category', 'category')
    .where('uce.userId = :userId', { userId })
    .orderBy('uce.totalExperience', 'DESC')
    .getMany();

  return result.map(exp => ({
    categoryId: exp.categoryId,
    categoryName: exp.category.name,
    totalExperience: exp.totalExperience,
  }));
}

export async function updateUserCategoryExperience(
  userId: string,
  categoryId: string,
  newTotalExperience: number
): Promise<UserCategoryExperience> {
  await ensureDbConnected();
  
  const userCategoryExp = await findOrCreateUserCategoryExperience(userId, categoryId);
  userCategoryExp.totalExperience = newTotalExperience;
  
  return await userCategoryExperienceRepo.save(userCategoryExp);
}

export async function getTotalUserExperience(userId: string): Promise<number> {
  await ensureDbConnected();
  
  const result = await userCategoryExperienceRepo
    .createQueryBuilder('uce')
    .select('SUM(uce.totalExperience)', 'total')
    .where('uce.userId = :userId', { userId })
    .getRawOne();

  return Number(result?.total) || 0;
}

export async function getTopUsersByExperience(limit: number = 10): Promise<{
  userId: string;
  username: string;
  totalExperience: number;
}[]> {
  await ensureDbConnected();
  
  const result = await userCategoryExperienceRepo
    .createQueryBuilder('uce')
    .leftJoinAndSelect('uce.user', 'user')
    .select([
      'uce.userId as "userId"',
      'user.username as username',
      'SUM(uce.totalExperience) as "totalExperience"'
    ])
    .groupBy('uce.userId, user.username')
    .orderBy('SUM(uce.totalExperience)', 'DESC')
    .limit(limit)
    .getRawMany();

  return result.map(row => ({
    userId: row.userId,
    username: row.username,
    totalExperience: Number(row.totalExperience),
  }));
}