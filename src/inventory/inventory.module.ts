import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InventoryLoan } from '../entities/inventory-loan.entity';
import { InventoryMaintenanceRequest } from '../entities/inventory-maintenance-request.entity';
import { Ministry } from '../entities/ministry.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem,
      InventoryLoan,
      InventoryMaintenanceRequest,
      Ministry
    ])
  ],
  controllers: [InventoryController],
  providers: [InventoryService]
})
export class InventoryModule {}
