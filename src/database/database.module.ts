import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { MuralItem } from '../entities/mural-item.entity';
import { CommunityPost } from '../entities/community-post.entity';
import { CommunityPostLike } from '../entities/community-post-like.entity';
import { CommunityPostComment } from '../entities/community-post-comment.entity';
import { Ministry } from '../entities/ministry.entity';
import { MinistryMember } from '../entities/ministry-member.entity';
import { BirthdayMessageTemplate } from '../entities/birthday-message-template.entity';
import { AccessProfile } from '../entities/access-profile.entity';
import { InternalEvent } from '../entities/internal-event.entity';
import { MinistryScheduleTemplate } from '../entities/ministry-schedule-template.entity';
import { EventMinistrySchedule } from '../entities/event-ministry-schedule.entity';
import { EventMinistryAssignment } from '../entities/event-ministry-assignment.entity';
import { UserTimelineEvent } from '../entities/user-timeline-event.entity';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InventoryLoan } from '../entities/inventory-loan.entity';
import { InventoryMaintenanceRequest } from '../entities/inventory-maintenance-request.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useSocket = Boolean(config.get<string>('DB_SOCKET_PATH'));
        const configuredHost = config.get<string>('DB_HOST') || '127.0.0.1';
        const tcpHost =
          configuredHost.toLowerCase() === 'localhost'
            ? '127.0.0.1'
            : configuredHost;

        return {
          type: 'mysql',
          host: useSocket ? undefined : tcpHost,
          socketPath: useSocket ? config.get<string>('DB_SOCKET_PATH') : undefined,
          port: useSocket ? undefined : config.get<number>('DB_PORT') || 3306,
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: [
            User,
            MuralItem,
            CommunityPost,
            CommunityPostLike,
            CommunityPostComment,
            Ministry,
            MinistryMember,
            BirthdayMessageTemplate,
            AccessProfile,
            InternalEvent,
            MinistryScheduleTemplate,
            EventMinistrySchedule,
            EventMinistryAssignment,
            UserTimelineEvent,
            InventoryItem,
            InventoryLoan,
            InventoryMaintenanceRequest
          ],
          synchronize: false,
          extra: {
            connectionLimit: config.get<number>('DB_CONNECTION_LIMIT') || 10
          },
          timezone: 'Z'
        };
      }
    })
  ]
})
export class DatabaseModule {}
