import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Habit } from './Habit';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Habit, habit => habit.category)
  habits: Habit[];

  @Column({ default: true })
	active: boolean;
}