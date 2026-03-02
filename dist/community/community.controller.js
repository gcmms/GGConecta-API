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
exports.CommunityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_enum_1 = require("../common/constants/roles.enum");
const comment_post_dto_1 = require("./dto/comment-post.dto");
const create_post_dto_1 = require("./dto/create-post.dto");
const like_post_dto_1 = require("./dto/like-post.dto");
const community_service_1 = require("./community.service");
let CommunityController = class CommunityController {
    constructor(communityService) {
        this.communityService = communityService;
    }
    async list(userId, limit, offset) {
        try {
            const parsedUserId = userId ? Number(userId) : undefined;
            const parsedLimit = Math.min(Math.max(Math.trunc(Number(limit)) || 30, 1), 100);
            const parsedOffset = Math.max(Math.trunc(Number(offset)) || 0, 0);
            const items = await this.communityService.list(parsedUserId, parsedLimit, parsedOffset);
            return items;
        }
        catch (error) {
            console.error('Failed to list community posts', error);
            throw new common_1.HttpException({ message: 'Erro ao carregar o feed.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(body) {
        const missing = ['user_id', 'content'].filter((field) => {
            const value = body[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missing.length > 0) {
            throw new common_1.HttpException({ message: `Campos obrigatórios ausentes: ${missing.join(', ')}` }, common_1.HttpStatus.BAD_REQUEST);
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
        }
        catch (error) {
            console.error('Failed to create community post', error);
            throw new common_1.HttpException({ message: 'Erro ao criar publicação.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async like(idParam, body) {
        const id = Number(idParam);
        const missing = ['user_id'].filter((field) => {
            const value = body[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missing.length > 0) {
            throw new common_1.HttpException({ message: 'user_id é obrigatório.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
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
        }
        catch (error) {
            console.error('Failed to toggle like', error);
            throw new common_1.HttpException({ message: 'Erro ao curtir publicação.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async comment(idParam, body) {
        const id = Number(idParam);
        const missing = ['user_id', 'comment'].filter((field) => {
            const value = body[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missing.length > 0) {
            throw new common_1.HttpException({ message: `Campos obrigatórios ausentes: ${missing.join(', ')}` }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
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
        }
        catch (error) {
            console.error('Failed to create comment', error);
            throw new common_1.HttpException({ message: 'Erro ao comentar.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listComments(idParam) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.communityService.listComments(id);
        }
        catch (error) {
            console.error('Failed to list comments', error);
            throw new common_1.HttpException({ message: 'Erro ao listar comentários.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deletePost(idParam) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const deleted = await this.communityService.deletePost(id);
            if (!deleted) {
                throw new common_1.HttpException('Publicação não encontrada.', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Publicação removida.' };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao remover publicação.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
};
exports.CommunityController = CommunityController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreateCommunityPostDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, like_post_dto_1.LikeCommunityPostDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "like", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_post_dto_1.CommentCommunityPostDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "comment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "listComments", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "deletePost", null);
exports.CommunityController = CommunityController = __decorate([
    (0, swagger_1.ApiTags)('Community'),
    (0, common_1.Controller)('community'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityController);
//# sourceMappingURL=community.controller.js.map