import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Habit } from './Habit';
import { UserCategoryExperience } from './UserCategoryExperience';
import { ExperienceTransaction } from './ExperienceTransaction';

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

  @OneToMany(() => UserCategoryExperience, userCategoryExperience => userCategoryExperience.category)
  userCategoryExperiences: UserCategoryExperience[];

  @OneToMany(() => ExperienceTransaction, experienceTransaction => experienceTransaction.category)
  experienceTransactions: ExperienceTransaction[];
}