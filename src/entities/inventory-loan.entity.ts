import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Ministry } from './ministry.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity({ name: 'inventory_loans' })
export class InventoryLoan {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'item_id', type: 'int', unsigned: true })
  itemId: number;

  @Column({ name: 'origin_ministry_id', type: 'int', unsigned: true })
  originMinistryId: number;

  @Column({ name: 'destination_ministry_id', type: 'int', unsigned: true })
  destinationMinistryId: number;

  @Column({ name: 'loaned_at', type: 'datetime' })
  loanedAt: Date;

  @Column({ name: 'expected_return_date', type: 'date', nullable: true })
  expectedReturnDate?: string | null;

  @Column({ name: 'returned_at', type: 'datetime', nullable: true })
  returnedAt?: Date | null;

  @Column({ type: 'varchar', length: 40, default: 'Aberto' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @ManyToOne(() => InventoryItem, (item) => item.loans, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;

  @ManyToOne(() => Ministry, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'origin_ministry_id' })
  originMinistry: Ministry;

  @ManyToOne(() => Ministry, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'destination_ministry_id' })
  destinationMinistry: Ministry;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
