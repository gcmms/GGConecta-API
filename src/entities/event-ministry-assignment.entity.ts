import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'event_ministry_assignments' })
export class EventMinistryAssignment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Index('idx_event_ministry_assignments_schedule_id')
  @Column({ name: 'schedule_id', type: 'int', unsigned: true })
  scheduleId: number;

  @Column({ name: 'slot_name', type: 'varchar', length: 120 })
  slotName: string;

  @Column({ name: 'slot_order', type: 'int', unsigned: true, default: 1 })
  slotOrder: number;

  @Column({ name: 'person_id', type: 'int', unsigned: true, nullable: true })
  personId?: number | null;

  @Column({ type: 'varchar', length: 40, default: 'Pendente' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
