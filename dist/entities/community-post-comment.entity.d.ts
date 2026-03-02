import { CommunityPost } from './community-post.entity';
import { User } from './user.entity';
export declare class CommunityPostComment {
    id: number;
    post: CommunityPost;
    user: User;
    postId: number;
    userId: number;
    comment: string;
    createdAt: Date;
}
