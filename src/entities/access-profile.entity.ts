import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'access_profiles' })
export class AccessProfile {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ name: 'base_role', type: 'varchar', length: 50, nullable: true })
  baseRole?: string | null;

  @Column({ name: 'is_system', type: 'tinyint', default: 0 })
  isSystem: boolean;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ name: 'can_dashboard', type: 'tinyint', default: 0 })
  canDashboard: boolean;

  @Column({ name: 'can_people', type: 'tinyint', default: 0 })
  canPeople: boolean;

  @Column({ name: 'can_ministries', type: 'tinyint', default: 0 })
  canMinistries: boolean;

  @Column({ name: 'can_posts', type: 'tinyint', default: 0 })
  canPosts: boolean;

  @Column({ name: 'can_prayers', type: 'tinyint', default: 0 })
  canPrayers: boolean;

  @Column({ name: 'can_events', type: 'tinyint', default: 0 })
  canEvents: boolean;

  @Column({ name: 'can_schedules', type: 'tinyint', default: 0 })
  canSchedules: boolean;

  @Column({ name: 'can_birthdays', type: 'tinyint', default: 0 })
  canBirthdays: boolean;

  @Column({ name: 'can_inventory', type: 'tinyint', default: 0 })
  canInventory: boolean;

  @Column({ name: 'can_settings', type: 'tinyint', default: 0 })
  canSettings: boolean;

  @Column({ name: 'can_access_profiles', type: 'tinyint', default: 0 })
  canAccessProfiles: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
