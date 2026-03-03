import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/constants/roles.enum';
import { CommentCommunityPostDto } from './dto/comment-post.dto';
import { CreateCommunityPostDto } from './dto/create-post.dto';
import { LikeCommunityPostDto } from './dto/like-post.dto';
import { CommunityService } from './community.service';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  async list(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    try {
      const parsedUserId = userId ? Number(userId) : undefined;
      const parsedLimit = Math.min(Math.max(Math.trunc(Number(limit)) || 30, 1), 100);
      const parsedOffset = Math.max(Math.trunc(Number(offset)) || 0, 0);
      const items = await this.communityService.list(parsedUserId, parsedLimit, parsedOffset);
      return items;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to list community posts', error);
      throw new HttpException(
        { message: 'Erro ao carregar o feed.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getById(
    @Param('id') idParam: string,
    @Query('userId') userId?: string
  ) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const parsedUserId = userId ? Number(userId) : undefined;
      const post = await this.communityService.findOne(id, parsedUserId);

      if (!post) {
        throw new HttpException({ message: 'Publicação não encontrada.' }, HttpStatus.NOT_FOUND);
      }

      return post;
    } catch (error: any) {
      if (error?.status) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Failed to get community post', error);
      throw new HttpException(
        { message: 'Erro ao carregar publicação.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async create(@Body() body: CreateCommunityPostDto) {
    const missing = ['user_id', 'content'].filter((field) => {
      const value = (body as Record<string, any>)[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      throw new HttpException(
        { message: `Campos obrigatórios ausentes: ${missing.join(', ')}` },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const post = await this.communityService.create({
        user_id: Number(body.user_id),
        content: body.content
      });

      return {
        message: 'Publicação criada com sucesso!',
        post
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create community post', error);
      throw new HttpException(
        { message: 'Erro ao criar publicação.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/like')
  async like(
    @Param('id') idParam: string,
    @Body() body: LikeCommunityPostDto
  ) {
    const id = Number(idParam);

    const missing = ['user_id'].filter((field) => {
      const value = (body as Record<string, any>)[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      throw new HttpException({ message: 'user_id é obrigatório.' }, HttpStatus.BAD_REQUEST);
    }

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.communityService.toggleLike({
        postId: id,
        userId: Number(body.user_id)
      });

      return {
        message: result.liked ? 'Publicação curtida com sucesso.' : 'Curtida removida.',
        liked: result.liked,
        likes_count: result.likesCount
      };
    } catch (error: any) {
      if (error?.status) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Failed to toggle like', error);
      throw new HttpException(
        { message: 'Erro ao curtir publicação.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/comments')
  async comment(
    @Param('id') idParam: string,
    @Body() body: CommentCommunityPostDto
  ) {
    const id = Number(idParam);

    const missing = ['user_id', 'comment'].filter((field) => {
      const value = (body as Record<string, any>)[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      throw new HttpException(
        { message: `Campos obrigatórios ausentes: ${missing.join(', ')}` },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.communityService.createComment({
        postId: id,
        userId: Number(body.user_id),
        comment: body.comment
      });

      return {
        message: 'Comentário enviado!',
        comments: result.comments,
        comments_count: result.commentsCount
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create comment', error);
      throw new HttpException(
        { message: 'Erro ao comentar.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/comments')
  async listComments(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.communityService.listComments(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to list comments', error);
      throw new HttpException(
        { message: 'Erro ao listar comentários.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deletePost(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const deleted = await this.communityService.deletePost(id);
      if (!deleted) {
        throw new HttpException('Publicação não encontrada.', HttpStatus.NOT_FOUND);
      }

      return { message: 'Publicação removida.' };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao remover publicação.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }
}
