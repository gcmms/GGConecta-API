import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityPost } from '../entities/community-post.entity';
import { CommunityPostComment } from '../entities/community-post-comment.entity';
import { CommunityPostLike } from '../entities/community-post-like.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postsRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityPostLike)
    private readonly likesRepository: Repository<CommunityPostLike>,
    @InjectRepository(CommunityPostComment)
    private readonly commentsRepository: Repository<CommunityPostComment>
  ) {}

  async list(userId?: number, limit = 30, offset = 0) {
    const rows = await this.postsRepository.query(
      `
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
      `,
      [userId || 0, limit, offset]
    );

    return Array.isArray(rows) ? rows : [];
  }

  async create({ user_id, content }: { user_id: number; content: string }) {
    const result = await this.postsRepository.query(
      `
        INSERT INTO community_posts (user_id, content)
        VALUES (?, ?)
      `,
      [user_id, content.trim()]
    );

    const insertedId = result?.insertId;

    const rows = await this.postsRepository.query(
      `
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
      `,
      [insertedId]
    );

    return Array.isArray(rows) ? rows[0] : null;
  }

  async toggleLike({ postId, userId }: { postId: number; userId: number }) {
    const existing = await this.likesRepository.findOne({
      where: { postId, userId }
    });

    let liked = false;

    if (existing) {
      await this.likesRepository.delete({ id: existing.id });
    } else {
      await this.likesRepository.insert({ postId, userId } as any);
      liked = true;
    }

    const countRows = await this.likesRepository.query(
      `SELECT COUNT(*) AS total FROM community_post_likes WHERE post_id = ?`,
      [postId]
    );

    const likesCount =
      Array.isArray(countRows) && countRows.length > 0
        ? Number(countRows[0].total)
        : 0;

    return { liked, likesCount };
  }

  async createComment({
    postId,
    userId,
    comment
  }: {
    postId: number;
    userId: number;
    comment: string;
  }) {
    await this.commentsRepository.query(
      `
        INSERT INTO community_post_comments (post_id, user_id, comment)
        VALUES (?, ?, ?)
      `,
      [postId, userId, comment.trim()]
    );

    const comments = await this.commentsRepository.query(
      `
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
      `,
      [postId]
    );

    const countRows = await this.commentsRepository.query(
      `SELECT COUNT(*) AS total FROM community_post_comments WHERE post_id = ?`,
      [postId]
    );

    const commentsCount =
      Array.isArray(countRows) && countRows.length > 0
        ? Number(countRows[0].total)
        : 0;

    return {
      comments: Array.isArray(comments) ? comments : [],
      commentsCount
    };
  }

  async listComments(postId: number) {
    const comments = await this.commentsRepository.query(
      `
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
      `,
      [postId]
    );

    return Array.isArray(comments) ? comments : [];
  }

  async deletePost(postId: number) {
    await this.commentsRepository.delete({ postId } as any);
    await this.likesRepository.delete({ postId } as any);
    const result = await this.postsRepository.delete({ id: postId } as any);
    return result.affected && result.affected > 0;
  }
}
