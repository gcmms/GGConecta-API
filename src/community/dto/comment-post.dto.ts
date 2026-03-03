import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentCommunityPostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comment: string;
}
