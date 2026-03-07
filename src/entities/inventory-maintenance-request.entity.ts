import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';
import { Ministry } from './ministry.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity({ name: 'inventory_maintenance_requests' })
@Unique('uq_inventory_maintenance_report_number', ['reportNumber'])
export class InventoryMaintenanceRequest {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'item_id', type: 'int', unsigned: true })
  itemId: number;

  @Column({ name: 'requester_ministry_id', type: 'int', unsigned: true })
  requesterMinistryId: number;

  @Column({ name: 'report_number', type: 'varchar', length: 120 })
  reportNumber: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 30, default: 'Média' })
  priority: string;

  @Column({ type: 'varchar', length: 40, default: 'Aberta' })
  status: string;

  @Column({ name: 'requested_at', type: 'datetime' })
  requestedAt: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt?: Date | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string | null;

  @ManyToOne(() => InventoryItem, (item) => item.maintenanceRequests, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;

  @ManyToOne(() => Ministry, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'requester_ministry_id' })
  requesterMinistry: Ministry;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
