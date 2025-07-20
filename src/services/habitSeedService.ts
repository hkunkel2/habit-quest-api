import { AppDataSource } from '../data-source';
import { Category } from '../entities/Category';
import { User } from '../entities/User';
import * as habitDB from '../db/habit';

export interface DefaultHabit {
  name: string;
  categoryName: string;
  status: 'Active' | 'Draft';
  startDate: Date;
}

const today = new Date(new Date().toISOString().split('T')[0]);

export const DEFAULT_STUDENT_HABITS: DefaultHabit[] = [
  {
    name: 'Study for 30 minutes',
    categoryName: 'School',
    status: 'Active',
    startDate: today
  },
  {
    name: 'Get 8 hours of sleep', 
    categoryName: 'Sleep',
    status: 'Active',
    startDate: today
  },
  {
    name: 'Exercise for 20 minutes',
    categoryName: 'Fitness',
    status: 'Active',
    startDate: today
  },
  {
    name: 'Read for 15 minutes',
    categoryName: 'Reading',
    status: 'Active',
    startDate: today
  },
  {
    name: 'Practice mindfulness for 5 minutes',
    categoryName: 'Mindfulness',
    status: 'Active',
    startDate: today
  }
];

export const createPreSeededHabits = async (userId: string): Promise<void> => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    
    for (const defaultHabit of DEFAULT_STUDENT_HABITS) {
      const category = await categoryRepository.findOne({
        where: { name: defaultHabit.categoryName }
      });
      
      if (category) {
        await habitDB.createHabit({
          name: defaultHabit.name,
          user: user,
          category: category,
          status: defaultHabit.status,
          startDate: defaultHabit.startDate
        });
      }
    }
  } catch (error) {
    console.error('Error creating pre-seeded habits:', error);
  }
};