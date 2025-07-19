import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';

@Entity()
@Index(['userId', 'categoryId'], { unique: true })
export class UserCategoryExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  categoryId: string;

  @Column({ type: 'integer', default: 0, nullable: false })
  totalExperience: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.userCategoryExperiences)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, category => category.userCategoryExperiences)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}