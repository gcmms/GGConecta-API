import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';
import { MinistryMember } from './ministry-member.entity';

@Entity({ name: 'ministries' })
@Unique('uq_ministries_name', ['name'])
export class Ministry {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  category?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'leader_user_id', type: 'int', unsigned: true, nullable: true })
  leaderUserId?: number | null;

  @Column({ name: 'presbyter_user_id', type: 'int', unsigned: true, nullable: true })
  presbyterUserId?: number | null;

  @ManyToOne(() => User, (user) => user.ledMinistries, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'leader_user_id' })
  leader?: User | null;

  @ManyToOne(() => User, (user) => user.presbyterResponsibleMinistries, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'presbyter_user_id' })
  presbyter?: User | null;

  @OneToMany(() => MinistryMember, (membership) => membership.ministry)
  memberships: MinistryMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
