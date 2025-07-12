import request from 'supertest';
import express from 'express';
import * as categoryController from '../controllers/categoryController';
import * as categoryDB from '../db/category';

jest.mock('../db/category');

const app = express();
app.use(express.json());
app.post('/categories', categoryController.addCategory);
app.patch('/categories/:id/toggle', categoryController.toggleCategoryActive);
app.get('/categories', categoryController.getCategories);

describe('Category Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addCategory', () => {
    it('should create a new category and return it', async () => {
      const mockCategory = { id: '1', name: 'Fitness', active: true };
      (categoryDB.createCategory as jest.Mock).mockResolvedValue(mockCategory);

      const res = await request(app).post('/categories').send({ name: 'Fitness' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCategory);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app).post('/categories').send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/i);
    });
  });

  describe('toggleCategoryActive', () => {
    it('should toggle active status of a category', async () => {
      const mockCategory = { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Nutrition', active: false };
      (categoryDB.toggleCategoryActive as jest.Mock).mockResolvedValue(mockCategory);

      const res = await request(app).patch('/categories/123e4567-e89b-12d3-a456-426614174000/toggle');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCategory);
    });

    it('should return 400 if ID is invalid', async () => {
      const res = await request(app).patch('/categories/invalid-id/toggle');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/uuid/i);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Fitness', active: true },
        { id: '2', name: 'Sleep', active: true }
      ];
      (categoryDB.getAllCategories as jest.Mock).mockResolvedValue(mockCategories);

      const res = await request(app).get('/categories');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCategories);
    });

    it('should return 500 if DB fails', async () => {
      (categoryDB.getAllCategories as jest.Mock).mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/categories');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database error');
    });
  });
});