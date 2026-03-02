import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const allowedChannels = ['Push', 'Email', 'WhatsApp'] as const;

export class CreateBirthdayTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @IsIn(allowedChannels)
  channel: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  body: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
