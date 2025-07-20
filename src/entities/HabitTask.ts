import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Habit } from './Habit';
import { Streak } from './Streak';
import { ExperienceTransaction } from './ExperienceTransaction';

@Entity()
export class HabitTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  taskDate: Date;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.habitTasks)
  user: User;

  @ManyToOne(() => Habit, habit => habit.habitTasks)
  habit: Habit;

  @ManyToOne(() => Streak, streak => streak.habitTasks)
  streak: Streak;

  @OneToMany(() => ExperienceTransaction, experienceTransaction => experienceTransaction.habitTask)
  experienceTransactions: ExperienceTransaction[];
}