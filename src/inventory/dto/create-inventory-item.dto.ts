import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ministry_id: number;

  @ApiProperty({ example: 'Mesa de som Yamaha MG16XU' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  name: string;

  @ApiProperty({ required: false, example: 'IPIGG-070326-3-4932' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  patrimony_number?: string;

  @ApiProperty({ example: 'Sala de áudio' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  storage_location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
