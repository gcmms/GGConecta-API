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
exports.MuralController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_enum_1 = require("../common/constants/roles.enum");
const create_mural_dto_1 = require("./dto/create-mural.dto");
const mural_service_1 = require("./mural.service");
let MuralController = class MuralController {
    constructor(muralService) {
        this.muralService = muralService;
    }
    async list() {
        try {
            return await this.muralService.list();
        }
        catch (error) {
            console.error('Failed to list mural items', error);
            throw new common_1.HttpException({ message: 'Erro ao listar mural.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(body) {
        try {
            const item = await this.muralService.create(body);
            return {
                message: 'Aviso criado com sucesso!',
                item
            };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao criar aviso.'
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
            const deleted = await this.muralService.remove(id);
            if (!deleted) {
                throw new common_1.HttpException('Aviso não encontrado.', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Aviso removido com sucesso.' };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao remover aviso.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
};
exports.MuralController = MuralController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MuralController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mural_dto_1.CreateMuralDto]),
    __metadata("design:returntype", Promise)
], MuralController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MuralController.prototype, "remove", null);
exports.MuralController = MuralController = __decorate([
    (0, swagger_1.ApiTags)('Mural'),
    (0, common_1.Controller)('mural'),
    __metadata("design:paramtypes", [mural_service_1.MuralService])
], MuralController);
//# sourceMappingURL=mural.controller.js.map