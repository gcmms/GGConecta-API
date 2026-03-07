import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessProfile } from '../entities/access-profile.entity';
import { User } from '../entities/user.entity';
import { AccessProfilesController } from './access-profiles.controller';
import { AccessProfilesService } from './access-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessProfile, User])],
  controllers: [AccessProfilesController],
  providers: [AccessProfilesService],
  exports: [AccessProfilesService]
})
export class AccessProfilesModule {}
