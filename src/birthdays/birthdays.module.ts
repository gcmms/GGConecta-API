import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BirthdayMessageTemplate } from '../entities/birthday-message-template.entity';
import { User } from '../entities/user.entity';
import { BirthdayTemplatesService } from './birthday-templates.service';
import { BirthdaysController } from './birthdays.controller';
import { BirthdaysService } from './birthdays.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, BirthdayMessageTemplate])],
  controllers: [BirthdaysController],
  providers: [BirthdaysService, BirthdayTemplatesService]
})
export class BirthdaysModule {}
