import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuralItem } from '../entities/mural-item.entity';
import { MuralController } from './mural.controller';
import { MuralService } from './mural.service';

@Module({
  imports: [TypeOrmModule.forFeature([MuralItem])],
  controllers: [MuralController],
  providers: [MuralService]
})
export class MuralModule {}
