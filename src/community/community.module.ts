import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityPost } from '../entities/community-post.entity';
import { CommunityPostComment } from '../entities/community-post-comment.entity';
import { CommunityPostLike } from '../entities/community-post-like.entity';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityPost, CommunityPostLike, CommunityPostComment])
  ],
  controllers: [CommunityController],
  providers: [CommunityService]
})
export class CommunityModule {}
