import { AppDataSource } from '../data-source';
import { Category } from '../entities/Category';
import { ensureDbConnected } from './index';

const categoryRepo = AppDataSource.getRepository(Category);

export const getAllCategories = async () => {
  await ensureDbConnected();
  return await categoryRepo.find({ where: { active: true } });
};

export const createCategory = async (name: string) => {
  await ensureDbConnected();
  const category = categoryRepo.create({ name, active: true });
  return await categoryRepo.save(category);
};

export const toggleCategoryActive = async (categoryId: string) => {
  await ensureDbConnected();
  const category = await categoryRepo.findOneByOrFail({ id: categoryId });
  category.active = !category.active;
  return await categoryRepo.save(category);
};

export const findCategoryById = async (id: string) => {
  await ensureDbConnected();
  return await categoryRepo.findOneBy({ id });
};