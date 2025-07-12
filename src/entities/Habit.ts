import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Category } from './Category';


@Entity()
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdDate: Date;

	@Column({ type: 'timestamp', nullable: true })
	startDate: Date | null;

  @ManyToOne(() => User, user => user.habits)
  user: User;

  @ManyToOne(() => Category, category => category.habits)
  category: Category;

	@Column({
    type: 'enum',
    enum: ['Active', 'Draft', 'Completed', 'Cancelled', 'Deleted'],
    default: 'Draft',
  })
  status: 'Active' | 'Draft' | 'Completed' | 'Cancelled' | 'Deleted';

}