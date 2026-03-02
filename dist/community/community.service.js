"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const community_post_entity_1 = require("../entities/community-post.entity");
const community_post_comment_entity_1 = require("../entities/community-post-comment.entity");
const community_post_like_entity_1 = require("../entities/community-post-like.entity");
let CommunityService = class CommunityService {
    constructor(postsRepository, likesRepository, commentsRepository) {
        this.postsRepository = postsRepository;
        this.likesRepository = likesRepository;
        this.commentsRepository = commentsRepository;
    }
    async list(userId, limit = 30, offset = 0) {
        const rows = await this.postsRepository.query(`
        SELECT
          p.id,
          p.user_id,
          p.content,
          p.created_at,
          p.updated_at,
          CONCAT(u.first_name, ' ', u.last_name) AS author_name,
          IFNULL(l.likes_count, 0) AS likes_count,
          IFNULL(c.comments_count, 0) AS comments_count,
          CASE WHEN ul.post_id IS NULL THEN 0 ELSE 1 END AS liked_by_user
        FROM community_posts p
        INNER JOIN users u ON u.id = p.user_id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS likes_count
          FROM community_post_likes
          GROUP BY post_id
        ) l ON l.post_id = p.id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS comments_count
          FROM community_post_comments
          GROUP BY post_id
        ) c ON c.post_id = p.id
        LEFT JOIN (
          SELECT post_id
          FROM community_post_likes
          WHERE user_id = ?
        ) ul ON ul.post_id = p.id
        ORDER BY p.created_at DESC
        LIMIT ?
        OFFSET ?
      `, [userId || 0, limit, offset]);
        return Array.isArray(rows) ? rows : [];
    }
    async create({ user_id, content }) {
        const result = await this.postsRepository.query(`
        INSERT INTO community_posts (user_id, content)
        VALUES (?, ?)
      `, [user_id, content.trim()]);
        const insertedId = result === null || result === void 0 ? void 0 : result.insertId;
        const rows = await this.postsRepository.query(`
        SELECT
          p.id,
          p.user_id,
          p.content,
          p.created_at,
          p.updated_at,
          CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM community_posts p
        INNER JOIN users u ON u.id = p.user_id
        WHERE p.id = ?
      `, [insertedId]);
        return Array.isArray(rows) ? rows[0] : null;
    }
    async toggleLike({ postId, userId }) {
        const existing = await this.likesRepository.findOne({
            where: { postId, userId }
        });
        let liked = false;
        if (existing) {
            await this.likesRepository.delete({ id: existing.id });
        }
        else {
            await this.likesRepository.insert({ postId, userId });
            liked = true;
        }
        const countRows = await this.likesRepository.query(`SELECT COUNT(*) AS total FROM community_post_likes WHERE post_id = ?`, [postId]);
        const likesCount = Array.isArray(countRows) && countRows.length > 0
            ? Number(countRows[0].total)
            : 0;
        return { liked, likesCount };
    }
    async createComment({ postId, userId, comment }) {
        await this.commentsRepository.query(`
        INSERT INTO community_post_comments (post_id, user_id, comment)
        VALUES (?, ?, ?)
      `, [postId, userId, comment.trim()]);
        const comments = await this.commentsRepository.query(`
        SELECT
          c.id,
          c.post_id,
          c.comment,
          c.created_at,
          CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM community_post_comments c
        INNER JOIN users u ON u.id = c.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
      `, [postId]);
        const countRows = await this.commentsRepository.query(`SELECT COUNT(*) AS total FROM community_post_comments WHERE post_id = ?`, [postId]);
        const commentsCount = Array.isArray(countRows) && countRows.length > 0
            ? Number(countRows[0].total)
            : 0;
        return {
            comments: Array.isArray(comments) ? comments : [],
            commentsCount
        };
    }
    async listComments(postId) {
        const comments = await this.commentsRepository.query(`
        SELECT
          c.id,
          c.post_id,
          c.comment,
          c.created_at,
          CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM community_post_comments c
        INNER JOIN users u ON u.id = c.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
      `, [postId]);
        return Array.isArray(comments) ? comments : [];
    }
    async deletePost(postId) {
        await this.commentsRepository.delete({ postId });
        await this.likesRepository.delete({ postId });
        const result = await this.postsRepository.delete({ id: postId });
        return result.affected && result.affected > 0;
    }
};
exports.CommunityService = CommunityService;
exports.CommunityService = CommunityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(community_post_entity_1.CommunityPost)),
    __param(1, (0, typeorm_1.InjectRepository)(community_post_like_entity_1.CommunityPostLike)),
    __param(2, (0, typeorm_1.InjectRepository)(community_post_comment_entity_1.CommunityPostComment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommunityService);
//# sourceMappingURL=community.service.js.map