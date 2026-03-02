import { User } from './user.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CommunityPostComment } from './community-post-comment.entity';
export declare class CommunityPost {
    id: number;
    user: User;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    likes: CommunityPostLike[];
    comments: CommunityPostComment[];
}
