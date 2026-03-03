import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommunityPostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
