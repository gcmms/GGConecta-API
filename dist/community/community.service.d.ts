import { Repository } from 'typeorm';
import { CommunityPost } from '../entities/community-post.entity';
import { CommunityPostComment } from '../entities/community-post-comment.entity';
import { CommunityPostLike } from '../entities/community-post-like.entity';
export declare class CommunityService {
    private readonly postsRepository;
    private readonly likesRepository;
    private readonly commentsRepository;
    constructor(postsRepository: Repository<CommunityPost>, likesRepository: Repository<CommunityPostLike>, commentsRepository: Repository<CommunityPostComment>);
    list(userId?: number, limit?: number, offset?: number): Promise<any[]>;
    create({ user_id, content }: {
        user_id: number;
        content: string;
    }): Promise<any>;
    toggleLike({ postId, userId }: {
        postId: number;
        userId: number;
    }): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    createComment({ postId, userId, comment }: {
        postId: number;
        userId: number;
        comment: string;
    }): Promise<{
        comments: any[];
        commentsCount: number;
    }>;
    listComments(postId: number): Promise<any[]>;
    deletePost(postId: number): Promise<boolean | 0 | null | undefined>;
}
