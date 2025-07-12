import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
import { Habit } from './Habit';
  
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
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToMany(() => Habit, habit => habit.user)
    habits: Habit[];
  }