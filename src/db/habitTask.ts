import { AppDataSource } from '../data-source';
import { HabitTask } from '../entities/HabitTask';
import { User } from '../entities/User';
import { Habit } from '../entities/Habit';
import { Streak } from '../entities/Streak';
import { ensureDbConnected } from './index';

const habitTaskRepository = AppDataSource.getRepository(HabitTask);

export const createHabitTask = async (data: {
  user: User;
  habit: Habit;
  streak: Streak;
  taskDate: Date;
}): Promise<HabitTask> => {
  await ensureDbConnected();
  const habitTask = habitTaskRepository.create(data);
  return await habitTaskRepository.save(habitTask);
};

export const findHabitTaskById = async (id: string): Promise<HabitTask | null> => {
  await ensureDbConnected();
  return await habitTaskRepository.findOne({
    where: { id },
    relations: ['user', 'habit', 'habit.category', 'streak'],
  });
};

export const findHabitTaskByDate = async (
  userId: string,
  habitId: string,
  taskDate: Date
): Promise<HabitTask | null> => {
  await ensureDbConnected();
  return await habitTaskRepository.findOne({
    where: {
      user: { id: userId },
      habit: { id: habitId },
      taskDate,
    },
    relations: ['user', 'habit', 'streak'],
  });
};

export const findHabitTasksByStreak = async (streakId: string): Promise<HabitTask[]> => {
  await ensureDbConnected();
  return await habitTaskRepository.find({
    where: {
      streak: { id: streakId },
    },
    relations: ['user', 'habit', 'streak'],
    order: { taskDate: 'ASC' },
  });
};

export const completeHabitTask = async (id: string): Promise<HabitTask> => {
  await ensureDbConnected();
  const completedAt = new Date();
  await habitTaskRepository.update(id, {
    isCompleted: true,
    completedAt,
  });
  
  const updatedTask = await habitTaskRepository.findOne({
    where: { id },
    relations: ['user', 'habit', 'habit.category', 'streak'],
  });
  
  if (!updatedTask) {
    throw new Error('Habit task not found');
  }
  
  return updatedTask;
};