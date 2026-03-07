import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'ministry_schedule_templates' })
export class MinistryScheduleTemplate {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'ministry_id', type: 'int', unsigned: true })
  ministryId: number;

  @Column({ name: 'slot_name', type: 'varchar', length: 120 })
  slotName: string;

  @Column({ type: 'int', unsigned: true, default: 1 })
  quantity: number;

  @Column({ name: 'sort_order', type: 'int', unsigned: true, default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: () => '1' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
