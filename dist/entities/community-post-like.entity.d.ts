import { CommunityPost } from './community-post.entity';
import { User } from './user.entity';
export declare class CommunityPostLike {
    id: number;
    post: CommunityPost;
    user: User;
    postId: number;
    userId: number;
}
