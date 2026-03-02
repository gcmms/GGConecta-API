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
exports.BirthdaysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_enum_1 = require("../common/constants/roles.enum");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const birthdays_service_1 = require("./birthdays.service");
const birthday_templates_service_1 = require("./birthday-templates.service");
const create_birthday_template_dto_1 = require("./dto/create-birthday-template.dto");
const list_birthdays_query_dto_1 = require("./dto/list-birthdays-query.dto");
let BirthdaysController = class BirthdaysController {
    constructor(birthdaysService, birthdayTemplatesService) {
        this.birthdaysService = birthdaysService;
        this.birthdayTemplatesService = birthdayTemplatesService;
    }
    async list(query) {
        try {
            return await this.birthdaysService.list(query);
        }
        catch (error) {
            if ((error === null || error === void 0 ? void 0 : error.status) === common_1.HttpStatus.BAD_REQUEST) {
                throw error;
            }
            console.error('Erro ao listar aniversariantes', error);
            throw new common_1.HttpException({ message: 'Erro ao carregar aniversariantes.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listTemplates() {
        try {
            return await this.birthdayTemplatesService.list();
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao listar templates.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
    async createTemplate(body) {
        try {
            const template = await this.birthdayTemplatesService.create(body);
            return { message: 'Template criado com sucesso.', template };
        }
        catch (error) {
            const status = (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Erro ao criar template.'
                : (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
            throw new common_1.HttpException({ message }, status);
        }
    }
};
exports.BirthdaysController = BirthdaysController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_birthdays_query_dto_1.ListBirthdaysQueryDto]),
    __metadata("design:returntype", Promise)
], BirthdaysController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BirthdaysController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_birthday_template_dto_1.CreateBirthdayTemplateDto]),
    __metadata("design:returntype", Promise)
], BirthdaysController.prototype, "createTemplate", null);
exports.BirthdaysController = BirthdaysController = __decorate([
    (0, swagger_1.ApiTags)('Birthdays'),
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    (0, common_1.Controller)('birthdays'),
    __metadata("design:paramtypes", [birthdays_service_1.BirthdaysService,
        birthday_templates_service_1.BirthdayTemplatesService])
], BirthdaysController);
//# sourceMappingURL=birthdays.controller.js.map