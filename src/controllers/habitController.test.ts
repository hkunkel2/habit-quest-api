import request from 'supertest';
import express from 'express';
import * as habitController from '../controllers/habitController';
import * as habitDB from '../db/habit';
import * as userDB from '../db/user';
import * as categoryDB from '../db/category';
import { mock } from 'node:test';

jest.mock('../db/habit');
jest.mock('../db/user');
jest.mock('../db/category');

const app = express();
app.use(express.json());
app.post('/habits/create', habitController.createHabit);
app.patch('/habits/:id/update', habitController.updateHabit);
app.delete('/habits/:id/delete', habitController.deleteHabit);
app.get('/habits/:userId', habitController.getHabitsByUser);

const mockUser = { id: '11111111-1111-1111-1111-111111111111' };
const mockCategory = { id: '22222222-2222-2222-2222-222222222222' };
const mockHabit = { id: '33333333-3333-3333-3333-333333333333', name: 'Workout' };

describe('Habit Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createHabit', () => {
    it('should create a habit when input and foreign keys are valid', async () => {

      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(mockCategory);
      (habitDB.createHabit as jest.Mock).mockResolvedValue(mockHabit);

      const res = await request(app).post('/habits/create').send({
        name: 'Workout',
        startDate: '2025-07-12T00:00:00.000Z',
        userId: mockUser.id,
        categoryId: mockCategory.id,
        status: 'Active',
      });

      expect(res.status).toBe(201);
      expect(res.body.habit).toEqual(mockHabit);
    });

    it('should return 400 if user is not found', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/habits/create').send({
        name: 'Workout',
        startDate: '2025-07-12T00:00:00.000Z',
        userId: mockUser.id,
        categoryId: mockCategory.id,
        status: 'Active',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/User not found/);
    });

    it('should return 400 if category is not found', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue({ id: mockUser.id });
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/habits/create').send({
        name: 'Workout',
        startDate: '2025-07-12T00:00:00.000Z',
        userId: mockUser.id,
        categoryId: mockCategory.id,
        status: 'Active',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Category not found/);
    });
  });

  describe('updateHabit', () => {
    it('should update a habit with valid data', async () => {
      (habitDB.updateHabit as jest.Mock).mockResolvedValue(mockHabit);

      const res = await request(app)
        .patch(`/habits/${mockHabit.id}/update`)
        .send({ name: 'Updated', status: 'Draft' });

      expect(res.status).toBe(200);
      expect(res.body.habit).toEqual(mockHabit);
    });

    it('should update a habit category when categoryId is provided and status is Draft', async () => {
      (habitDB.findHabitById as jest.Mock).mockResolvedValue({ ...mockHabit, status: 'Draft' });
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(mockCategory);
      (habitDB.updateHabit as jest.Mock).mockResolvedValue(mockHabit);

      const res = await request(app)
        .patch(`/habits/${mockHabit.id}/update`)
        .send({ categoryId: mockCategory.id });

      expect(res.status).toBe(200);
      expect(habitDB.findHabitById).toHaveBeenCalledWith(mockHabit.id);
      expect(categoryDB.findCategoryById).toHaveBeenCalledWith(mockCategory.id);
      expect(habitDB.updateHabit).toHaveBeenCalledWith(mockHabit.id, { category: mockCategory });
    });

    it('should return 400 when trying to update category of non-Draft habit', async () => {
      (habitDB.findHabitById as jest.Mock).mockResolvedValue({ ...mockHabit, status: 'Active' });

      const res = await request(app)
        .patch(`/habits/${mockHabit.id}/update`)
        .send({ categoryId: mockCategory.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Category can only be updated when habit status is Draft');
    });

    it('should return 404 when habit is not found during category update', async () => {
      (habitDB.findHabitById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch(`/habits/${mockHabit.id}/update`)
        .send({ categoryId: mockCategory.id });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Habit not found');
    });

    it('should return 400 if categoryId is invalid', async () => {
      (categoryDB.findCategoryById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch(`/habits/${mockHabit.id}/update`)
        .send({ categoryId: 'invalid-category-id' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Category not found');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .patch(`/habits/${mockHabit.id}/update`)
        .send({ status: 'Active' });

      expect(res.status).toBe(400);
    });
  });

  describe('deleteHabit', () => {
    it('should delete a habit successfully', async () => {
      const res = await request(app).delete(`/habits/${mockHabit.id}/delete`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Habit deleted');
      expect(habitDB.deleteHabit).toHaveBeenCalledWith(mockHabit.id);
    });
  });

  describe('getHabitsByUser', () => {
    it('should return habits for a given user', async () => {
      const mockHabits = [
        { id: '33333333-3333-3333-3333-333333333333', name: 'Workout' },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Read' },
      ];
      (habitDB.getHabitsByUser as jest.Mock).mockResolvedValue(mockHabits);

      const res = await request(app).get(`/habits/${mockUser.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockHabits);
    });

    it('should return 500 if the DB call fails', async () => {
      (habitDB.getHabitsByUser as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get(`/habits/${mockUser.id}`);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });
});