import { Request, Response } from 'express';
import * as streakDB from '../db/streak';
import * as habitTaskDB from '../db/habitTask';
import * as habitDB from '../db/habit';
import * as userDB from '../db/user';
import { userHabitStatusSchema, habitTaskCompleteSchema } from '../validators/streakValidators';
import { ExperienceCalculator } from '../services/ExperienceCalculator';
import * as userCategoryExperienceDB from '../db/userCategoryExperience';
import * as experienceTransactionDB from '../db/experienceTransaction';
import { ExperienceTransactionType } from '../entities/ExperienceTransaction';

export const updateHabitStatus = async (req: Request, res: Response) => {
  try {
    const { userId, habitId } = userHabitStatusSchema.parse({ 
      userId: req.params.userId,
      habitId: req.query.habitId 
    });

    const user = await userDB.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (habitId) {
      const habit = await habitDB.findHabitById(habitId);
      if (!habit) {
        res.status(404).json({ error: 'Habit not found' });
        return;
      }

      const habitStatus = await processSingleHabitStatus(userId, habitId);
      res.status(habitStatus.created ? 201 : 200).json(habitStatus);
      return;
    }

    const userHabits = await habitDB.getHabitsByUser(userId);
    const allHabitsStatus = [];

    for (const habit of userHabits) {
      const habitStatus = await processSingleHabitStatus(userId, habit.id);
      allHabitsStatus.push({
        habitId: habit.id,
        habitName: habit.name,
        ...habitStatus
      });
    }

    res.status(200).json({
      message: 'Status retrieved for all user habits',
      habits: allHabitsStatus
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(400).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};

export const getHabitStreaks = async (req: Request, res: Response) => {
  try {
    const { userId, habitId } = userHabitStatusSchema.parse({ 
      userId: req.params.userId,
      habitId: req.query.habitId 
    });

    const user = await userDB.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (habitId) {
      const habit = await habitDB.findHabitById(habitId);
      if (!habit) {
        res.status(404).json({ error: 'Habit not found' });
        return;
      }

      const currentStreak = await streakDB.findActiveStreakByUserAndHabit(userId, habitId);
      const allStreaks = await streakDB.findStreaksByUserAndHabit(userId, habitId);
      
      let habitTasks: any[] = [];
      if (currentStreak) {
        habitTasks = await habitTaskDB.findHabitTasksByStreak(currentStreak.id);
      }

      res.status(200).json({
        habitId,
        currentStreak,
        allStreaks,
        habitTasks,
      });
      return;
    }

    const userHabits = await habitDB.getHabitsByUser(userId);
    const allHabitsStreaks = [];

    for (const habit of userHabits) {
      const currentStreak = await streakDB.findActiveStreakByUserAndHabit(userId, habit.id);
      const allStreaks = await streakDB.findStreaksByUserAndHabit(userId, habit.id);
      
      let habitTasks: any[] = [];
      if (currentStreak) {
        habitTasks = await habitTaskDB.findHabitTasksByStreak(currentStreak.id);
      }

      allHabitsStreaks.push({
        habitId: habit.id,
        habitName: habit.name,
        currentStreak,
        allStreaks,
        habitTasks
      });
    }

    res.status(200).json({
      message: 'Streaks retrieved for all user habits',
      habits: allHabitsStreaks
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(400).json({ error: error.message || 'An unexpected error occurred' });
    }
  }
};

export const completeHabitTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      res.status(400).json({ error: 'Task ID is required' });
      return;
    }

    const existingTask = await habitTaskDB.findHabitTaskById(taskId);

    if (!existingTask) {
      res.status(404).json({ error: 'Habit task not found' });
      return;
    }

    if (existingTask.isCompleted) {
      res.status(400).json({ error: 'Habit task already completed' });
      return;
    }

    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    
    const taskDate = new Date(existingTask.taskDate);
    const taskDateString = taskDate.toISOString().split('T')[0];
    
    if (taskDateString !== todayDateString) {
      res.status(400).json({ 
        error: 'Habit tasks can only be completed on the day they were created for' 
      });
      return;
    }

    if (existingTask.habit.status !== 'Active') {
      res.status(400).json({ error: `Cannot complete ${existingTask.habit.status} habit. Only Active habits can be completed.` });
      return;
    }

    const completedTask = await habitTaskDB.completeHabitTask(existingTask.id);
    
    const streak = existingTask.streak;
    const updatedStreakCount = streak.count + 1;
    await streakDB.updateStreak(streak.id, {
      count: updatedStreakCount,
    });
    const experienceCalculator = new ExperienceCalculator();
    const experienceResult = experienceCalculator.calculateExperienceGain(updatedStreakCount);
    
    if (!existingTask.habit.category) {
      throw new Error('Habit category not found - cannot award experience');
    }
    
    const categoryId = existingTask.habit.category.id;
    await userCategoryExperienceDB.addExperienceToCategory(
      existingTask.user.id,
      categoryId,
      experienceResult.totalExperience
    );

    await experienceTransactionDB.createExperienceTransaction({
      userId: existingTask.user.id,
      categoryId: categoryId,
      habitTaskId: existingTask.id,
      type: ExperienceTransactionType.HABIT_COMPLETION,
      experienceGained: experienceResult.totalExperience,
      streakCount: updatedStreakCount,
      multiplier: experienceResult.multiplier,
      description: `Completed habit: ${existingTask.habit.name} (Streak: ${updatedStreakCount})`,
    });

    const currentStreak = await streakDB.findActiveStreakByUserAndHabit(existingTask.user.id, existingTask.habit.id);

    res.status(200).json({
      message: 'Habit task completed successfully',
      habitTask: completedTask,
      currentStreak,
      experienceGained: {
        baseExperience: experienceResult.baseExperience,
        streakBonus: experienceResult.streakBonus,
        totalExperience: experienceResult.totalExperience,
        multiplier: experienceResult.multiplier,
        category: existingTask.habit.category.name,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'An unexpected error occurred' });
  }
};

export async function processSingleHabitStatus(userId: string, habitId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habit = await habitDB.findHabitById(habitId);
  if (!habit) {
    throw new Error('Habit not found');
  }

  if (habit.status !== 'Active') {
    const currentStreak = await streakDB.findActiveStreakByUserAndHabit(userId, habitId);
    const allStreaks = await streakDB.findStreaksByUserAndHabit(userId, habitId);

    return {
      message: `Habit is ${habit.status} - no task created`,
      habitTask: null,
      currentStreak,
      allStreaks,
      created: false
    };
  }

  let existingTask = await habitTaskDB.findHabitTaskByDate(userId, habitId, today);

  if (existingTask) {
    const currentStreak = await streakDB.findActiveStreakByUserAndHabit(userId, habitId);
    const allStreaks = await streakDB.findStreaksByUserAndHabit(userId, habitId);

    return {
      message: existingTask.isCompleted ? 'Habit already completed for today' : 'Habit task exists for today',
      habitTask: existingTask,
      currentStreak,
      allStreaks,
      created: false
    };
  }

  const user = await userDB.findUserById(userId);
  
  let activeStreak = await streakDB.findActiveStreakByUserAndHabit(userId, habitId);

  if (!activeStreak) {
    activeStreak = await streakDB.createStreak({
      user: user!,
      habit: habit!,
      startDate: today,
      count: 0,
    });
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayTask = await habitTaskDB.findHabitTaskByDate(userId, habitId, yesterday);
    
    if (!yesterdayTask || !yesterdayTask.isCompleted) {
      await streakDB.endStreak(activeStreak.id, yesterday);
      
      activeStreak = await streakDB.createStreak({
        user: user!,
        habit: habit!,
        startDate: today,
        count: 0,
      });
    }
  }

  const newTask = await habitTaskDB.createHabitTask({
    user: user!,
    habit: habit!,
    streak: activeStreak,
    taskDate: today,
  });

  const currentStreak = await streakDB.findActiveStreakByUserAndHabit(userId, habitId);
  const allStreaks = await streakDB.findStreaksByUserAndHabit(userId, habitId);

  return {
    message: 'Habit task created for today',
    habitTask: newTask,
    currentStreak,
    allStreaks,
    created: true
  };
}