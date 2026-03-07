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
import { Ministry } from './ministry.entity';
import { InventoryLoan } from './inventory-loan.entity';
import { InventoryMaintenanceRequest } from './inventory-maintenance-request.entity';

@Entity({ name: 'inventory_items' })
@Unique('uq_inventory_items_patrimony_number', ['patrimonyNumber'])
export class InventoryItem {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'ministry_id', type: 'int', unsigned: true })
  ministryId: number;

  @Column({ type: 'varchar', length: 180 })
  name: string;

  @Column({ name: 'patrimony_number', type: 'varchar', length: 120 })
  patrimonyNumber: string;

  @Column({ name: 'storage_location', type: 'varchar', length: 180 })
  storageLocation: string;

  @Column({ type: 'varchar', length: 40, default: 'Disponivel' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'disposed_at', type: 'datetime', nullable: true })
  disposedAt?: Date | null;

  @Column({ name: 'disposal_reason', type: 'text', nullable: true })
  disposalReason?: string | null;

  @ManyToOne(() => Ministry, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'ministry_id' })
  ministry: Ministry;

  @OneToMany(() => InventoryLoan, (loan) => loan.item)
  loans: InventoryLoan[];

  @OneToMany(() => InventoryMaintenanceRequest, (maintenance) => maintenance.item)
  maintenanceRequests: InventoryMaintenanceRequest[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
