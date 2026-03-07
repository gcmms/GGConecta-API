import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAccessSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  access_profile_id?: number | null;
}

