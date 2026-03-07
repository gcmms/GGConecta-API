import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAccessProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  base_role?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  can_dashboard?: boolean;

  @IsOptional()
  @IsBoolean()
  can_people?: boolean;

  @IsOptional()
  @IsBoolean()
  can_ministries?: boolean;

  @IsOptional()
  @IsBoolean()
  can_posts?: boolean;

  @IsOptional()
  @IsBoolean()
  can_prayers?: boolean;

  @IsOptional()
  @IsBoolean()
  can_events?: boolean;

  @IsOptional()
  @IsBoolean()
  can_schedules?: boolean;

  @IsOptional()
  @IsBoolean()
  can_birthdays?: boolean;

  @IsOptional()
  @IsBoolean()
  can_inventory?: boolean;

  @IsOptional()
  @IsBoolean()
  can_settings?: boolean;

  @IsOptional()
  @IsBoolean()
  can_access_profiles?: boolean;
}

