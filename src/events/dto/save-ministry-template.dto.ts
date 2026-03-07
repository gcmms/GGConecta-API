import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

class MinistryTemplateSlotDto {
  @ApiProperty({ example: 'Câmera' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slot_name: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class SaveMinistryTemplateDto {
  @ApiProperty({
    type: [MinistryTemplateSlotDto],
    example: [
      { slot_name: 'Câmera', quantity: 1 },
      { slot_name: 'Auxiliar', quantity: 1 }
    ]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MinistryTemplateSlotDto)
  slots: MinistryTemplateSlotDto[];
}
