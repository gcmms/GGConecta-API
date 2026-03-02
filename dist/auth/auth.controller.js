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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
function extractErrorStatusAndMessage(error, fallbackInternalMessage) {
    const status = error instanceof common_1.HttpException
        ? error.getStatus()
        : (error === null || error === void 0 ? void 0 : error.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof common_1.HttpException ? error.getResponse() : error === null || error === void 0 ? void 0 : error.response;
    const responseMessage = typeof response === 'string'
        ? response
        : typeof (response === null || response === void 0 ? void 0 : response.message) === 'string'
            ? response.message
            : undefined;
    const message = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
        ? fallbackInternalMessage
        : responseMessage || (error === null || error === void 0 ? void 0 : error.message) || 'Erro.';
    return { status, message };
}
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(body) {
        try {
            const user = await this.authService.register(body);
            return {
                message: 'Usuário criado com sucesso!',
                user
            };
        }
        catch (error) {
            const { status, message } = extractErrorStatusAndMessage(error, 'Erro ao criar usuário.');
            throw new common_1.HttpException({ message }, status);
        }
    }
    async login(body) {
        const missing = ['email', 'password'].filter((field) => {
            const value = body[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missing.length > 0) {
            throw new common_1.HttpException({ message: 'Email e senha são obrigatórios.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const { token, user } = await this.authService.login(body);
            return {
                message: 'Login realizado com sucesso!',
                token,
                user
            };
        }
        catch (error) {
            const { status, message } = extractErrorStatusAndMessage(error, 'Erro ao realizar login.');
            throw new common_1.HttpException({ message }, status);
        }
    }
    async loginAdmin(body) {
        const missing = ['email', 'password'].filter((field) => {
            const value = body[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missing.length > 0) {
            throw new common_1.HttpException({ message: 'Email e senha são obrigatórios.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const { token, user } = await this.authService.loginAdmin(body);
            return {
                message: 'Login administrativo realizado com sucesso!',
                token,
                user
            };
        }
        catch (error) {
            const { status, message } = extractErrorStatusAndMessage(error, 'Erro ao realizar login.');
            throw new common_1.HttpException({ message }, status);
        }
    }
    async me(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new common_1.HttpException({ message: 'Usuário não identificado.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const user = await this.authService.currentUser(userId);
            return { user };
        }
        catch (error) {
            const { status, message } = extractErrorStatusAndMessage(error, 'Erro ao carregar usuário.');
            throw new common_1.HttpException({ message }, status);
        }
    }
    async updateProfile(req, body) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new common_1.HttpException({ message: 'Usuário não identificado.' }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const user = await this.authService.updateProfile(userId, body);
            return { user, message: 'Perfil atualizado com sucesso.' };
        }
        catch (error) {
            const { status, message } = extractErrorStatusAndMessage(error, 'Erro ao atualizar perfil.');
            throw new common_1.HttpException({ message }, status);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('login/admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('bearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map