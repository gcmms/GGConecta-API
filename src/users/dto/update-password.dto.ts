import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ enum: ['auto', 'manual'] })
  @IsIn(['auto', 'manual'])
  mode: 'auto' | 'manual';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  send_email?: boolean;
}
