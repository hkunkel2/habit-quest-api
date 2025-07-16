import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

export enum RelationshipType {
  PENDING = 'PENDING',
  FRIEND = 'FRIEND',
  BLOCKED = 'BLOCKED',
}

@Entity()
@Unique(['userId', 'targetUserId'])
export class UserRelationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  targetUserId: string;

  @Column({ 
    type: 'enum', 
    enum: RelationshipType,
    default: RelationshipType.PENDING 
  })
  type: RelationshipType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;
}