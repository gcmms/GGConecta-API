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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_enum_1 = require("../common/constants/roles.enum");
const update_profile_dto_1 = require("../auth/dto/update-profile.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async list() {
        try {
            const members = await this.usersService.listMembers();
            return members;
        }
        catch (error) {
            console.error('Failed to list members', error);
            throw new common_1.HttpException({ message: 'Erro ao listar membros da igreja.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(idParam) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.usersService.findMemberById(id);
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao carregar membro.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
    async updateRole(idParam, body) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const user = await this.usersService.updateMemberRole(id, body);
            return {
                message: 'Papel atualizado com sucesso.',
                user
            };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao atualizar papel.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
    async updateMember(idParam, body) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const user = await this.usersService.updateMember(id, body);
            return {
                message: 'Membro atualizado com sucesso.',
                user
            };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao atualizar membro.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
    async remove(idParam) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const user = await this.usersService.deactivateMember(id);
            return { message: 'Membro inativado com sucesso.', user };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao inativar membro.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMember", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map