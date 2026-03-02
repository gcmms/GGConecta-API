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
exports.MinistriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_enum_1 = require("../common/constants/roles.enum");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const create_ministry_dto_1 = require("./dto/create-ministry.dto");
const update_ministry_dto_1 = require("./dto/update-ministry.dto");
const ministries_service_1 = require("./ministries.service");
let MinistriesController = class MinistriesController {
    constructor(ministriesService) {
        this.ministriesService = ministriesService;
    }
    async list() {
        try {
            return await this.ministriesService.list();
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao listar ministérios.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
    async findOne(idParam) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.ministriesService.findById(id);
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao carregar ministério.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
    async create(body) {
        try {
            const ministry = await this.ministriesService.create(body);
            return { message: 'Ministério criado com sucesso.', ministry };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao criar ministério.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
    async update(idParam, body) {
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.HttpException({ message: 'ID inválido.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const ministry = await this.ministriesService.update(id, body);
            return { message: 'Ministério atualizado com sucesso.', ministry };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao atualizar ministério.'
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
            await this.ministriesService.remove(id);
            return { message: 'Ministério removido com sucesso.' };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao remover ministério.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
};
exports.MinistriesController = MinistriesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MinistriesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MinistriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ministry_dto_1.CreateMinistryDto]),
    __metadata("design:returntype", Promise)
], MinistriesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ministry_dto_1.UpdateMinistryDto]),
    __metadata("design:returntype", Promise)
], MinistriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MinistriesController.prototype, "remove", null);
exports.MinistriesController = MinistriesController = __decorate([
    (0, swagger_1.ApiTags)('Ministries'),
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    (0, common_1.Controller)('ministries'),
    __metadata("design:paramtypes", [ministries_service_1.MinistriesService])
], MinistriesController);
//# sourceMappingURL=ministries.controller.js.map