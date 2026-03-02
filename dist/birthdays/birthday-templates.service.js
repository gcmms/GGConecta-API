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
exports.BirthdayTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const birthday_message_template_entity_1 = require("../entities/birthday-message-template.entity");
const safeTrim = (value) => (value === null || value === void 0 ? void 0 : value.trim()) || null;
const extractAllowedVariables = (text) => Array.from(new Set((text.match(/\{[a-zA-Z0-9_]+\}/g) || []).map((token) => token.trim()))).sort();
const mapTemplate = (template) => {
    var _a, _b, _c, _d;
    return ({
        id: template.id,
        name: template.name,
        channel: template.channel,
        title: template.title || null,
        body: template.body,
        allowed_variables: extractAllowedVariables(`${template.title || ''} ${template.body || ''}`.trim()),
        is_active: Boolean(template.isActive),
        created_at: ((_b = (_a = template.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) || null,
        updated_at: ((_d = (_c = template.updatedAt) === null || _c === void 0 ? void 0 : _c.toISOString) === null || _d === void 0 ? void 0 : _d.call(_c)) || null
    });
};
let BirthdayTemplatesService = class BirthdayTemplatesService {
    constructor(templatesRepository) {
        this.templatesRepository = templatesRepository;
    }
    async onModuleInit() {
        await this.ensureDefaultTemplates();
    }
    async list() {
        const templates = await this.templatesRepository.find({
            order: { createdAt: 'ASC', id: 'ASC' }
        });
        return templates.map(mapTemplate);
    }
    async create(data) {
        var _a;
        const name = safeTrim(data.name);
        const channel = safeTrim(data.channel);
        const title = safeTrim(data.title);
        const body = safeTrim(data.body);
        if (!name || !channel || !body) {
            throw new common_1.HttpException('Os campos nome, canal e mensagem são obrigatórios.', common_1.HttpStatus.BAD_REQUEST);
        }
        const existing = await this.templatesRepository.findOne({
            where: { name }
        });
        if (existing) {
            throw new common_1.HttpException('Já existe um template com este nome.', common_1.HttpStatus.BAD_REQUEST);
        }
        const saved = await this.templatesRepository.save(this.templatesRepository.create({
            name,
            channel,
            title,
            body,
            isActive: (_a = data.is_active) !== null && _a !== void 0 ? _a : true
        }));
        return mapTemplate(saved);
    }
    async ensureDefaultTemplates() {
        const count = await this.templatesRepository.count();
        if (count > 0)
            return;
        const defaults = [
            this.templatesRepository.create({
                name: 'Parabéns Padrão',
                channel: 'Push',
                title: 'Feliz aniversário!',
                body: 'Querido(a) {primeiro_nome}, a IPIGG deseja um feliz aniversário! Que Deus abençoe seus {idade} anos com saúde e alegria.',
                isActive: true
            }),
            this.templatesRepository.create({
                name: 'Aniversário com Versículo',
                channel: 'Email',
                title: 'Hoje é um dia especial, {primeiro_nome}!',
                body: 'Parabéns, {primeiro_nome}! Que o Senhor te fortaleça neste novo ciclo. "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele." (Salmos 118:24)',
                isActive: true
            })
        ];
        await this.templatesRepository.save(defaults);
    }
};
exports.BirthdayTemplatesService = BirthdayTemplatesService;
exports.BirthdayTemplatesService = BirthdayTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(birthday_message_template_entity_1.BirthdayMessageTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BirthdayTemplatesService);
//# sourceMappingURL=birthday-templates.service.js.map