import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { Ministry } from './ministry.entity';
import { User } from './user.entity';

@Entity({ name: 'ministry_members' })
@Unique('uq_ministry_members', ['ministryId', 'userId'])
export class MinistryMember {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'ministry_id', type: 'int', unsigned: true })
  ministryId: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => Ministry, (ministry) => ministry.memberships, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'ministry_id' })
  ministry: Ministry;

  @ManyToOne(() => User, (user) => user.ministryMemberships, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
