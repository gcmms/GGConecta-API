import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MuralModule } from './mural/mural.module';
import { CommunityModule } from './community/community.module';
import { EventsModule } from './events/events.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MinistriesModule } from './ministries/ministries.module';
import { BirthdaysModule } from './birthdays/birthdays.module';
import { AccessProfilesModule } from './access-profiles/access-profiles.module';
import { InventoryModule } from './inventory/inventory.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MuralModule,
    CommunityModule,
    EventsModule,
    DashboardModule,
    MinistriesModule,
    BirthdaysModule,
    AccessProfilesModule,
    InventoryModule
  ],
  controllers: [AppController]
})
export class AppModule {}
