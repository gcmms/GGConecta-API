import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { User } from './user.entity';

@Entity({ name: 'community_post_comments' })
export class CommunityPostComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityPost, (post) => post.comments, {
    onDelete: 'CASCADE'
  })
  post: CommunityPost;

  @ManyToOne(() => User, (user) => user.comments, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
