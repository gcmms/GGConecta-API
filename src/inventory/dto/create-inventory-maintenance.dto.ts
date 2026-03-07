import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

const priorityOptions = ['Baixa', 'Média', 'Alta'] as const;
const statusOptions = ['Aberta', 'EmAndamento', 'Resolvida'] as const;

export class CreateInventoryMaintenanceDto {
  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  item_id: number;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requester_ministry_id: number;

  @ApiProperty({ example: 'Microfone com ruído e perda de sinal.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ required: false, enum: priorityOptions, default: 'Média' })
  @IsOptional()
  @IsIn(priorityOptions)
  priority?: (typeof priorityOptions)[number];

  @ApiProperty({ required: false, example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}

export class UpdateInventoryMaintenanceDto {
  @ApiProperty({ required: false, enum: statusOptions })
  @IsOptional()
  @IsIn(statusOptions)
  status?: (typeof statusOptions)[number];

  @ApiProperty({ required: false, enum: priorityOptions })
  @IsOptional()
  @IsIn(priorityOptions)
  priority?: (typeof priorityOptions)[number];

  @ApiProperty({ required: false, example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({ required: false, example: 'Troca de cápsula e cabo concluída.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  resolution_notes?: string;
}
