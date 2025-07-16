import request from 'supertest';
import express from 'express';
import * as streakController from '../controllers/streakController';
import * as streakDB from '../db/streak';
import * as habitTaskDB from '../db/habitTask';
import * as habitDB from '../db/habit';
import * as userDB from '../db/user';

jest.mock('../db/streak');
jest.mock('../db/habitTask');
jest.mock('../db/habit');
jest.mock('../db/user');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { id: '11111111-1111-1111-1111-111111111111' };
  next();
});

app.post('/habits/users/:userId/status', streakController.updateHabitStatus);
app.get('/habits/users/:userId/streaks', streakController.getHabitStreaks);
app.patch('/habits/task/:id/complete', streakController.completeHabitTask);

const mockUser = { 
  id: '11111111-1111-1111-1111-111111111111',
  email: 'test@example.com',
  username: 'testuser'
};

const mockHabit = { 
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Daily Exercise',
  status: 'Active'
};

const mockStreak = {
  id: '33333333-3333-3333-3333-333333333333',
  startDate: '2025-07-10T00:00:00.000Z',
  endDate: null,
  count: 0,
  isActive: true,
  user: mockUser,
  habit: mockHabit
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const mockHabitTask = {
  id: '44444444-4444-4444-4444-444444444444',
  taskDate: today.toISOString(),
  isCompleted: false,
  completedAt: null,
  user: mockUser,
  habit: mockHabit,
  streak: mockStreak
};

describe('Streak Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateHabitStatus', () => {
    it('should return existing habit task status for specific habit', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.findHabitById as jest.Mock).mockResolvedValue(mockHabit);
      (habitTaskDB.findHabitTaskByDate as jest.Mock).mockResolvedValue(mockHabitTask);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue(mockStreak);
      (streakDB.findStreaksByUserAndHabit as jest.Mock).mockResolvedValue([mockStreak]);

      const res = await request(app)
        .post(`/habits/users/${mockUser.id}/status?habitId=${mockHabit.id}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Habit task exists for today');
      expect(res.body.habitTask).toEqual(mockHabitTask);
      expect(res.body.currentStreak).toBeDefined();
      expect(res.body.allStreaks).toBeDefined();
    });

    it('should return completed task data if habit task already completed', async () => {
      const completedTask = { ...mockHabitTask, isCompleted: true };
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.findHabitById as jest.Mock).mockResolvedValue(mockHabit);
      (habitTaskDB.findHabitTaskByDate as jest.Mock).mockResolvedValue(completedTask);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue(mockStreak);
      (streakDB.findStreaksByUserAndHabit as jest.Mock).mockResolvedValue([mockStreak]);

      const res = await request(app)
        .post(`/habits/users/${mockUser.id}/status?habitId=${mockHabit.id}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Habit already completed for today');
      expect(res.body.habitTask).toEqual(completedTask);
      expect(res.body.currentStreak).toBeDefined();
      expect(res.body.allStreaks).toBeDefined();
    });

    it('should create new habit task and streak for first time', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.findHabitById as jest.Mock).mockResolvedValue(mockHabit);
      (habitTaskDB.findHabitTaskByDate as jest.Mock).mockResolvedValue(null);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue(null);
      (streakDB.createStreak as jest.Mock).mockResolvedValue(mockStreak);
      (habitTaskDB.createHabitTask as jest.Mock).mockResolvedValue(mockHabitTask);
      (streakDB.findStreaksByUserAndHabit as jest.Mock).mockResolvedValue([mockStreak]);

      const res = await request(app)
        .post(`/habits/users/${mockUser.id}/status?habitId=${mockHabit.id}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Habit task created for today');
      expect(res.body.habitTask).toEqual(mockHabitTask);
      expect(streakDB.createStreak).toHaveBeenCalled();
      expect(habitTaskDB.createHabitTask).toHaveBeenCalled();
    });

    it('should return status for all user habits when no habitId provided', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.getHabitsByUser as jest.Mock).mockResolvedValue([mockHabit]);
      (habitTaskDB.findHabitTaskByDate as jest.Mock).mockResolvedValue(mockHabitTask);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue(mockStreak);
      (streakDB.findStreaksByUserAndHabit as jest.Mock).mockResolvedValue([mockStreak]);

      const res = await request(app)
        .post(`/habits/users/${mockUser.id}/status`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Status retrieved for all user habits');
      expect(res.body.habits).toHaveLength(1);
      expect(res.body.habits[0].habitId).toBe(mockHabit.id);
      expect(res.body.habits[0].habitName).toBe(mockHabit.name);
    });

    it('should return 404 if habit not found', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.findHabitById as jest.Mock).mockResolvedValue(null);

      const validUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/habits/users/${mockUser.id}/status?habitId=${validUuid}`)
        .send();

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Habit not found');
    });

    it('should return 404 if user not found', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(null);

      const validUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/habits/users/${validUuid}/status?habitId=${mockHabit.id}`)
        .send();

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should not create task for non-Active habit', async () => {
      const draftHabit = { ...mockHabit, status: 'Draft' };
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.findHabitById as jest.Mock).mockResolvedValue(draftHabit);
      (habitTaskDB.findHabitTaskByDate as jest.Mock).mockResolvedValue(null);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue(null);
      (streakDB.findStreaksByUserAndHabit as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .post(`/habits/users/${mockUser.id}/status?habitId=${mockHabit.id}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Habit is Draft - no task created');
      expect(res.body.habitTask).toBeNull();
      expect(res.body.created).toBe(false);
      expect(habitTaskDB.createHabitTask).not.toHaveBeenCalled();
      expect(streakDB.createStreak).not.toHaveBeenCalled();
    });
    
  });

  describe('getHabitStreaks', () => {
    it('should return current and all streaks for a specific habit with habit tasks', async () => {
      const allStreaks = [mockStreak, { ...mockStreak, id: 'other-streak', isActive: false }];
      const habitTasks = [mockHabitTask];
      
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.findHabitById as jest.Mock).mockResolvedValue(mockHabit);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue(mockStreak);
      (streakDB.findStreaksByUserAndHabit as jest.Mock).mockResolvedValue(allStreaks);
      (habitTaskDB.findHabitTasksByStreak as jest.Mock).mockResolvedValue(habitTasks);

      const res = await request(app)
        .get(`/habits/users/${mockUser.id}/streaks?habitId=${mockHabit.id}`);

      expect(res.status).toBe(200);
      expect(res.body.habitId).toBe(mockHabit.id);
      expect(res.body.currentStreak).toEqual(mockStreak);
      expect(res.body.allStreaks).toEqual(allStreaks);
      expect(res.body.habitTasks).toEqual(habitTasks);
    });

    it('should return streaks for all user habits when no habitId provided', async () => {
      const allStreaks = [mockStreak];
      const habitTasks = [mockHabitTask];
      
      (userDB.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (habitDB.getHabitsByUser as jest.Mock).mockResolvedValue([mockHabit]);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue(mockStreak);
      (streakDB.findStreaksByUserAndHabit as jest.Mock).mockResolvedValue(allStreaks);
      (habitTaskDB.findHabitTasksByStreak as jest.Mock).mockResolvedValue(habitTasks);

      const res = await request(app)
        .get(`/habits/users/${mockUser.id}/streaks`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Streaks retrieved for all user habits');
      expect(res.body.habits).toHaveLength(1);
      expect(res.body.habits[0].habitId).toBe(mockHabit.id);
      expect(res.body.habits[0].habitName).toBe(mockHabit.name);
      expect(res.body.habits[0].currentStreak).toEqual(mockStreak);
    });

    it('should return 404 if user not found', async () => {
      (userDB.findUserById as jest.Mock).mockResolvedValue(null);

      const validUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/habits/users/${validUuid}/streaks`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('completeHabitTask', () => {
    it('should complete existing habit task and update streak', async () => {
      (habitTaskDB.findHabitTaskById as jest.Mock).mockResolvedValue(mockHabitTask);
      (habitTaskDB.completeHabitTask as jest.Mock).mockResolvedValue({
        ...mockHabitTask,
        isCompleted: true,
        completedAt: new Date()
      });
      (streakDB.updateStreak as jest.Mock).mockResolvedValue(mockStreak);
      (streakDB.findActiveStreakByUserAndHabit as jest.Mock).mockResolvedValue({
        ...mockStreak,
        count: 3
      });

      const res = await request(app)
        .patch(`/habits/task/${mockHabitTask.id}/complete`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Habit task completed successfully');
      expect(res.body.habitTask).toBeDefined();
      expect(res.body.currentStreak).toBeDefined();
    });

    it('should return 404 if habit task not found', async () => {
      (habitTaskDB.findHabitTaskById as jest.Mock).mockResolvedValue(null);

      const validUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .patch(`/habits/task/${validUuid}/complete`)
        .send();

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Habit task not found');
    });

    it('should return 400 if habit task already completed', async () => {
      (habitTaskDB.findHabitTaskById as jest.Mock).mockResolvedValue({
        ...mockHabitTask,
        isCompleted: true
      });

      const res = await request(app)
        .patch(`/habits/task/${mockHabitTask.id}/complete`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Habit task already completed');
    });

    it('should not allow completion of yesterday\'s task', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const yesterdayTask = { ...mockHabitTask, taskDate: yesterday.toISOString() };
      (habitTaskDB.findHabitTaskById as jest.Mock).mockResolvedValue(yesterdayTask);

      const res = await request(app)
        .patch(`/habits/task/${mockHabitTask.id}/complete`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Habit tasks can only be completed on the day they were created for');
    });

    it('should not allow completion of future task', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const futureTask = { ...mockHabitTask, taskDate: tomorrow.toISOString() };
      (habitTaskDB.findHabitTaskById as jest.Mock).mockResolvedValue(futureTask);

      const res = await request(app)
        .patch(`/habits/task/${mockHabitTask.id}/complete`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Habit tasks can only be completed on the day they were created for');
    });

    it('should not allow completion of non-Active habit', async () => {
      const draftHabit = { ...mockHabit, status: 'Draft' };
      const draftHabitTask = { ...mockHabitTask, habit: draftHabit };
      (habitTaskDB.findHabitTaskById as jest.Mock).mockResolvedValue(draftHabitTask);

      const res = await request(app)
        .patch(`/habits/task/${mockHabitTask.id}/complete`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Cannot complete Draft habit. Only Active habits can be completed.');
    });
  });
});