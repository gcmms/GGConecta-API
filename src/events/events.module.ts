import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalEvent } from '../entities/internal-event.entity';
import { MinistryScheduleTemplate } from '../entities/ministry-schedule-template.entity';
import { EventMinistrySchedule } from '../entities/event-ministry-schedule.entity';
import { EventMinistryAssignment } from '../entities/event-ministry-assignment.entity';
import { Ministry } from '../entities/ministry.entity';
import { User } from '../entities/user.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternalEvent,
      MinistryScheduleTemplate,
      EventMinistrySchedule,
      EventMinistryAssignment,
      Ministry,
      User
    ])
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
