import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCommunityPostDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  user_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
