import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Habit } from './Habit';
import { HabitTask } from './HabitTask';

@Entity()
export class Streak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.streaks)
  user: User;

  @ManyToOne(() => Habit, habit => habit.streaks)
  habit: Habit;

  @OneToMany(() => HabitTask, habitTask => habitTask.streak)
  habitTasks: HabitTask[];
}