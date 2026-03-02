import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { User } from './user.entity';

@Entity({ name: 'community_post_likes' })
export class CommunityPostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityPost, (post) => post.likes, { onDelete: 'CASCADE' })
  post: CommunityPost;

  @ManyToOne(() => User, (user) => user.likes, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'user_id' })
  userId: number;
}
