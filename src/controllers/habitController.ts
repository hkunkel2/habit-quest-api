import { Request, Response } from 'express';
import * as habitDB from '../db/habit';
import * as userDB from '../db/user';
import * as categoryDB from '../db/category';
import { createHabitSchema, updateHabitSchema } from '../validators/habitValidators';

export const createHabit = async (req: Request, res: Response) => {
  try {
    const { name, startDate, userId, categoryId, status} = createHabitSchema.parse(req.body);
    const userEntity = await userDB.findUserById(userId);
    if (!userEntity) throw new Error('User not found');
    const categoryEntity = await categoryDB.findCategoryById(categoryId);
    if (!categoryEntity) throw new Error('Category not found');
    const habit = await habitDB.createHabit({name, startDate, user: userEntity, category: categoryEntity, status});
    res.status(201).json({ message: 'Habit created', habit });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateHabit = async (req: Request, res: Response) => {
  try {
    const {id, body} = updateHabitSchema.parse({
        id: req.params.id,
        body: req.body,
      });
    const habit = await habitDB.updateHabit(id, body);
    res.status(200).json({ message: 'Habit updated', habit });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await habitDB.deleteHabit(id);
    res.status(200).json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getHabitsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const habits = await habitDB.getHabitsByUser(userId);
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};