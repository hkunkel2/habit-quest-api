import { AppDataSource } from '../data-source';
import { Streak } from '../entities/Streak';
import { User } from '../entities/User';
import { Habit } from '../entities/Habit';
import { ensureDbConnected } from './index';

const streakRepository = AppDataSource.getRepository(Streak);

export const createStreak = async (data: {
  user: User;
  habit: Habit;
  startDate: Date;
  count?: number;
}): Promise<Streak> => {
  await ensureDbConnected();
  const streak = streakRepository.create({
    ...data,
    count: data.count ?? 0,
    isActive: true,
  });
  return await streakRepository.save(streak);
};

export const findActiveStreakByUserAndHabit = async (userId: string, habitId: string): Promise<Streak | null> => {
  await ensureDbConnected();
  return await streakRepository.findOne({
    where: {
      user: { id: userId },
      habit: { id: habitId },
      isActive: true,
    },
    relations: ['user', 'habit', 'habitTasks'],
    order: { createdAt: 'DESC' },
  });
};

export const findStreaksByUserAndHabit = async (userId: string, habitId: string): Promise<Streak[]> => {
  await ensureDbConnected();
  return await streakRepository.find({
    where: {
      user: { id: userId },
      habit: { id: habitId },
    },
    relations: ['user', 'habit', 'habitTasks'],
    order: { createdAt: 'DESC' },
  });
};

export const updateStreak = async (id: string, data: Partial<Streak>): Promise<Streak> => {
  await ensureDbConnected();
  await streakRepository.update(id, data);
  const updatedStreak = await streakRepository.findOne({
    where: { id },
    relations: ['user', 'habit', 'habitTasks'],
  });
  if (!updatedStreak) {
    throw new Error('Streak not found');
  }
  return updatedStreak;
};

export const endStreak = async (id: string, endDate: Date): Promise<Streak> => {
  await ensureDbConnected();
  return await updateStreak(id, {
    endDate,
    isActive: false,
  });
};