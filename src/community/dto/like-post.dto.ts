import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class LikeCommunityPostDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  user_id: number;
}
