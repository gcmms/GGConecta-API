import { CommentCommunityPostDto } from './dto/comment-post.dto';
import { CreateCommunityPostDto } from './dto/create-post.dto';
import { LikeCommunityPostDto } from './dto/like-post.dto';
import { CommunityService } from './community.service';
export declare class CommunityController {
    private readonly communityService;
    constructor(communityService: CommunityService);
    list(userId?: string, limit?: string, offset?: string): Promise<any[]>;
    create(body: CreateCommunityPostDto): Promise<{
        message: string;
        post: any;
    }>;
    like(idParam: string, body: LikeCommunityPostDto): Promise<{
        message: string;
        liked: boolean;
        likes_count: number;
    }>;
    comment(idParam: string, body: CommentCommunityPostDto): Promise<{
        message: string;
        comments: any[];
        comments_count: number;
    }>;
    listComments(idParam: string): Promise<any[]>;
    deletePost(idParam: string): Promise<{
        message: string;
    }>;
}
