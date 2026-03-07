import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'event_ministry_schedules' })
@Unique('uq_event_ministry_schedules_event_ministry', ['eventKey', 'ministryId'])
export class EventMinistrySchedule {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Index('idx_event_ministry_schedules_event_key')
  @Column({ name: 'event_key', type: 'varchar', length: 255 })
  eventKey: string;

  @Column({ name: 'event_source', type: 'varchar', length: 30 })
  eventSource: string;

  @Column({ name: 'event_title', type: 'varchar', length: 180 })
  eventTitle: string;

  @Column({ name: 'event_start_date', type: 'datetime', nullable: true })
  eventStartDate?: Date | null;

  @Column({ name: 'ministry_id', type: 'int', unsigned: true })
  ministryId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
