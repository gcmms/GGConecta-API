import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateInventoryLoanDto {
  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  item_id: number;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destination_ministry_id: number;

  @ApiProperty({ required: false, example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  expected_return_date?: string;

  @ApiProperty({ required: false, example: 'Emprestado para congresso jovem.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ReturnInventoryLoanDto {
  @ApiProperty({ required: false, example: 'Retornado em bom estado.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  notes?: string;
}
