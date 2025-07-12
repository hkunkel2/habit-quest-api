import { Request, Response } from 'express';
import * as categoryDB from '../db/category';
import { createCategorySchema, toggleCategorySchema } from '../validators/categoryValidators';

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name } = createCategorySchema.parse(req.body);
    const category = await categoryDB.createCategory(name);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' });
  }
};

export const toggleCategoryActive = async (req: Request, res: Response) => {
  try {
    toggleCategorySchema.parse({ id: req.params.id });
    const category = await categoryDB.toggleCategoryActive(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid ID' });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryDB.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
};