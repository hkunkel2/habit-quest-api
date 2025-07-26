import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Streak } from './Streak';
import { HabitTask } from './HabitTask';


@Entity()
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

	@Column({ type: 'timestamp', nullable: true })
	startDate: Date | null;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => User, user => user.habits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, category => category.habits, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

	@Column({
    type: 'enum',
    enum: ['Active', 'Draft', 'Completed', 'Cancelled', 'Deleted'],
    default: 'Draft',
  })
  status: 'Active' | 'Draft' | 'Completed' | 'Cancelled' | 'Deleted';

  @OneToMany(() => Streak, streak => streak.habit, { cascade: true })
  streaks: Streak[];

  @OneToMany(() => HabitTask, habitTask => habitTask.habit, { cascade: true })
  habitTasks: HabitTask[];

}