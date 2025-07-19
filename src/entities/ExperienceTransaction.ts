import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { HabitTask } from './HabitTask';

export enum ExperienceTransactionType {
  HABIT_COMPLETION = 'HABIT_COMPLETION',
  STREAK_BONUS = 'STREAK_BONUS',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
}

@Entity()
@Index(['userId', 'createdAt'])
@Index(['categoryId', 'createdAt'])
export class ExperienceTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  categoryId: string;

  @Column({ type: 'uuid', nullable: true })
  habitTaskId?: string;

  @Column({ type: 'enum', enum: ExperienceTransactionType, nullable: false })
  type: ExperienceTransactionType;

  @Column({ type: 'integer', nullable: false })
  experienceGained: number;

  @Column({ type: 'integer', nullable: true })
  streakCount?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  multiplier?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.experienceTransactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, category => category.experienceTransactions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => HabitTask, habitTask => habitTask.experienceTransactions, { nullable: true })
  @JoinColumn({ name: 'habitTaskId' })
  habitTask?: HabitTask;
}