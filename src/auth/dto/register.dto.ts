import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsDateString()
  birth_date: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  social_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rg_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rg_issuer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rg_state?: string;

  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  baptism_date?: string;

  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  profession_faith_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergency_contact_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergency_contact_phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  person_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  member_status?: string;

  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  church_entry_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  church_origin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ required: false, type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
