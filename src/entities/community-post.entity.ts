import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CommunityPostComment } from './community-post-comment.entity';

@Entity({ name: 'community_posts' })
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CommunityPostLike, (like) => like.post)
  likes: CommunityPostLike[];

  @OneToMany(() => CommunityPostComment, (comment) => comment.post)
  comments: CommunityPostComment[];
}
