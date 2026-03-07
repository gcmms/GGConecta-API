import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserTimelineEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ format: 'date' })
  @IsDateString()
  event_date: string;

  @ApiProperty({ required: false, example: 'Batismo' })
  @IsOptional()
  @IsString()
  event_type?: string;
}
