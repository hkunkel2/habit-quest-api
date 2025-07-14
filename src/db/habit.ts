import { AppDataSource } from '../data-source';
import { Habit } from '../entities/Habit';
import { ensureDbConnected } from './index';

const habitRepo = AppDataSource.getRepository(Habit);

export const createHabit = async (data: Partial<Habit>) => {
  await ensureDbConnected();
  const habit = habitRepo.create(data);
  return await habitRepo.save(habit);
};

export const getHabitsByUser = async (userId: string) => {
	await ensureDbConnected();
  return await habitRepo.find({
    where: { user: { id: userId } },
    relations: ['category'],
  });
};

export const updateHabit = async (id: string, data: Partial<Habit>) => {
	await ensureDbConnected();
  await habitRepo.update(id, data);
  return await habitRepo.findOneByOrFail({ id });
};

export const deleteHabit = async (id: string) => {
	await ensureDbConnected();
  await habitRepo.delete(id);
};

export const findHabitById = async (id: string) => {
	await ensureDbConnected();
  return await habitRepo.findOne({
    where: { id },
    relations: ['user', 'category'],
  });
};