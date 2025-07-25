import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}
import { Habit } from './Habit';
import { Streak } from './Streak';
import { HabitTask } from './HabitTask';
import { UserRelationship } from './UserRelationship';
import { UserCategoryExperience } from './UserCategoryExperience';
import { ExperienceTransaction } from './ExperienceTransaction';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    email: string;
  
    @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
    username: string;
  
    @Column({ type: 'varchar', length: 100, nullable: false })
    password: string;
  
    @Column({ type: 'enum', enum: Theme, default: Theme.LIGHT })
    theme: Theme;
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToMany(() => Habit, habit => habit.user, { cascade: true })
    habits: Habit[];

    @OneToMany(() => Streak, streak => streak.user, { cascade: true })
    streaks: Streak[];

    @OneToMany(() => HabitTask, habitTask => habitTask.user, { cascade: true })
    habitTasks: HabitTask[];

    @OneToMany(() => UserRelationship, userRelationship => userRelationship.user, { cascade: true })
    userRelationships: UserRelationship[];

    @OneToMany(() => UserRelationship, userRelationship => userRelationship.targetUser, { cascade: true })
    targetUserRelationships: UserRelationship[];

    @OneToMany(() => UserCategoryExperience, userCategoryExperience => userCategoryExperience.user, { cascade: true })
    userCategoryExperiences: UserCategoryExperience[];

    @OneToMany(() => ExperienceTransaction, experienceTransaction => experienceTransaction.user, { cascade: true })
    experienceTransactions: ExperienceTransaction[];
  }