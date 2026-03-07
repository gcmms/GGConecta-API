import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInternalEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ format: 'date-time', example: '2026-03-15T19:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @ApiProperty({ format: 'date-time', example: '2026-03-15T21:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  all_day?: boolean;
}
