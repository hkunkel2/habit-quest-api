import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Habit } from './Habit';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => Habit, habit => habit.category)
  habits: Habit[];

  @Column({ type: 'boolean', default: true })
	active: boolean;
}