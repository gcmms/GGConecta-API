import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ministry } from '../entities/ministry.entity';
import { MinistryMember } from '../entities/ministry-member.entity';
import { User } from '../entities/user.entity';
import { MinistriesController } from './ministries.controller';
import { MinistriesService } from './ministries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ministry, MinistryMember, User])],
  controllers: [MinistriesController],
  providers: [MinistriesService]
})
export class MinistriesModule {}
