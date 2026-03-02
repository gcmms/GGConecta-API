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
exports.MuralService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mural_item_entity_1 = require("../entities/mural-item.entity");
const mapItem = (item) => {
    var _a, _b, _c, _d, _e, _f, _g;
    return ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        publish_date: item.publishDate,
        link: (_a = item.link) !== null && _a !== void 0 ? _a : null,
        created_at: (_d = (_c = (_b = item.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : null,
        updated_at: (_g = (_f = (_e = item.updatedAt) === null || _e === void 0 ? void 0 : _e.toISOString) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : null
    });
};
let MuralService = class MuralService {
    constructor(muralRepository) {
        this.muralRepository = muralRepository;
    }
    async list() {
        const items = await this.muralRepository.find({
            order: { publishDate: 'DESC' }
        });
        return items.map(mapItem);
    }
    async create(data) {
        var _a;
        const missingFields = ['title', 'subtitle', 'publish_date'].filter((field) => {
            const value = data[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missingFields.length > 0) {
            throw new common_1.HttpException(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        const created = this.muralRepository.create({
            title: data.title.trim(),
            subtitle: data.subtitle.trim(),
            publishDate: data.publish_date,
            link: ((_a = data.link) === null || _a === void 0 ? void 0 : _a.trim()) || null
        });
        const saved = await this.muralRepository.save(created);
        return mapItem(saved);
    }
    async remove(id) {
        const result = await this.muralRepository.delete(id);
        return result.affected && result.affected > 0;
    }
};
exports.MuralService = MuralService;
exports.MuralService = MuralService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mural_item_entity_1.MuralItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MuralService);
//# sourceMappingURL=mural.service.js.map