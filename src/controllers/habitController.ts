import { Request, Response } from 'express';
import * as habitDB from '../db/habit';
import * as userDB from '../db/user';
import * as categoryDB from '../db/category';
import { createHabitSchema, updateHabitSchema } from '../validators/habitValidators';

export const createHabit = async (req: Request, res: Response) => {
  try {
    const { name, userId, categoryId, status} = createHabitSchema.parse(req.body);
    const userEntity = await userDB.findUserById(userId);
    if (!userEntity) throw new Error('User not found');
    const categoryEntity = await categoryDB.findCategoryById(categoryId);
    if (!categoryEntity) throw new Error('Category not found');
    const startDate = status === 'Active' ? new Date(new Date().toISOString().split('T')[0]) : undefined;
    const habit = await habitDB.createHabit({name, startDate, user: userEntity, category: categoryEntity, status});
    res.status(201).json({ message: 'Habit created', habit });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateHabit = async (req: Request, res: Response) => {
  try {
    let {id, body} = updateHabitSchema.parse({
        id: req.params.id,
        body: req.body,
      });
    
    let updateData: any = { ...body };
    if (body.categoryId) {
    	const currentHabit = await habitDB.findHabitById(id);
      if (!currentHabit) {
        throw new Error('Habit not found');
      }
      if (currentHabit.status !== 'Draft') {
        throw new Error('Category can only be updated when habit status is Draft');
      }
      
      const categoryEntity = await categoryDB.findCategoryById(body.categoryId);
      if (!categoryEntity) {
        throw new Error('Category not found');
      }
      const { categoryId, ...restData } = updateData;
      updateData = { ...restData, category: categoryEntity };
    }

		if (body.status === 'Active') {
			(body as any).startDate = new Date(new Date().toISOString().split('T')[0]);
		}
    
    const habit = await habitDB.updateHabit(id, updateData);
    res.status(200).json({ message: 'Habit updated', habit });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === 'Habit not found') {
      res.status(404).json({ error: errorMessage });
    } else if (errorMessage === 'Category not found' || errorMessage === 'Category can only be updated when habit status is Draft') {
      res.status(400).json({ error: errorMessage });
    } else {
      res.status(400).json({ error: errorMessage });
    }
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