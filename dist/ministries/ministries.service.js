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
exports.MinistriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ministry_entity_1 = require("../entities/ministry.entity");
const ministry_member_entity_1 = require("../entities/ministry-member.entity");
const user_entity_1 = require("../entities/user.entity");
const safeTrim = (value) => {
    const trimmed = value === null || value === void 0 ? void 0 : value.trim();
    return trimmed ? trimmed : null;
};
const normalizeIdList = (ids) => Array.from(new Set((ids || []).filter((id) => Number.isInteger(id) && id > 0)));
const isActiveMember = (user) => (user.personType || '').trim().toLowerCase() === 'membro' &&
    (user.memberStatus || '').trim().toLowerCase() === 'ativo';
let MinistriesService = class MinistriesService {
    constructor(ministriesRepository, ministryMembersRepository, usersRepository) {
        this.ministriesRepository = ministriesRepository;
        this.ministryMembersRepository = ministryMembersRepository;
        this.usersRepository = usersRepository;
    }
    async list() {
        const ministries = await this.ministriesRepository.find({
            relations: {
                leader: true,
                presbyter: true,
                memberships: {
                    user: true
                }
            },
            order: {
                name: 'ASC'
            }
        });
        return ministries.map((ministry) => this.mapMinistry(ministry));
    }
    async findById(id) {
        const ministry = await this.loadMinistryOrFail(id);
        return this.mapMinistry(ministry);
    }
    async create(data) {
        var _a;
        const sanitizedName = safeTrim(data.name);
        if (!sanitizedName) {
            throw new common_1.HttpException('O nome do ministério é obrigatório.', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.assertNameAvailable(sanitizedName);
        const leaderId = data.leader_user_id;
        const presbyterId = data.presbyter_user_id;
        const memberIds = normalizeIdList(data.member_user_ids);
        if (leaderId && memberIds.includes(leaderId)) {
            throw new common_1.HttpException('O líder deve ser informado apenas no campo de líder, não na lista de membros.', common_1.HttpStatus.BAD_REQUEST);
        }
        if (leaderId) {
            await this.validateActiveMembers([leaderId], 'Líder');
        }
        if (presbyterId) {
            await this.validateActiveMembers([presbyterId], 'Presbítero');
        }
        if (memberIds.length > 0) {
            await this.validateActiveMembers(memberIds, 'Membro');
        }
        const ministry = await this.ministriesRepository.save(this.ministriesRepository.create({
            name: sanitizedName,
            category: safeTrim(data.category),
            description: safeTrim(data.description),
            isActive: (_a = data.is_active) !== null && _a !== void 0 ? _a : true,
            leaderUserId: leaderId || null,
            presbyterUserId: presbyterId || null
        }));
        await this.replaceMembers(ministry.id, memberIds);
        const reloaded = await this.loadMinistryOrFail(ministry.id);
        return this.mapMinistry(reloaded);
    }
    async update(id, data) {
        var _a, _b, _c, _d, _e;
        const ministry = await this.loadMinistryOrFail(id);
        const sanitizedName = data.name !== undefined ? safeTrim(data.name) : undefined;
        if (data.name !== undefined && !sanitizedName) {
            throw new common_1.HttpException('O nome do ministério é obrigatório.', common_1.HttpStatus.BAD_REQUEST);
        }
        if (sanitizedName && sanitizedName !== ministry.name) {
            await this.assertNameAvailable(sanitizedName, id);
        }
        const nextLeaderId = data.leader_user_id === undefined ? ministry.leaderUserId || null : data.leader_user_id;
        const nextPresbyterId = data.presbyter_user_id === undefined
            ? ministry.presbyterUserId || null
            : data.presbyter_user_id;
        const shouldReplaceMembers = data.member_user_ids !== undefined;
        const nextMemberIds = shouldReplaceMembers
            ? normalizeIdList(data.member_user_ids)
            : ministry.memberships.map((membership) => membership.userId);
        if (nextLeaderId && nextMemberIds.includes(nextLeaderId)) {
            throw new common_1.HttpException('O líder deve ser informado apenas no campo de líder, não na lista de membros.', common_1.HttpStatus.BAD_REQUEST);
        }
        if (nextLeaderId) {
            await this.validateActiveMembers([nextLeaderId], 'Líder');
        }
        if (nextPresbyterId) {
            await this.validateActiveMembers([nextPresbyterId], 'Presbítero');
        }
        if (nextMemberIds.length > 0) {
            await this.validateActiveMembers(nextMemberIds, 'Membro');
        }
        ministry.name = sanitizedName !== null && sanitizedName !== void 0 ? sanitizedName : ministry.name;
        ministry.category = (_b = (_a = safeTrim(data.category)) !== null && _a !== void 0 ? _a : ministry.category) !== null && _b !== void 0 ? _b : null;
        ministry.description = (_d = (_c = safeTrim(data.description)) !== null && _c !== void 0 ? _c : ministry.description) !== null && _d !== void 0 ? _d : null;
        ministry.isActive = (_e = data.is_active) !== null && _e !== void 0 ? _e : ministry.isActive;
        ministry.leaderUserId = nextLeaderId;
        ministry.presbyterUserId = nextPresbyterId;
        await this.ministriesRepository.save(ministry);
        if (shouldReplaceMembers) {
            await this.replaceMembers(id, nextMemberIds);
        }
        const reloaded = await this.loadMinistryOrFail(id);
        return this.mapMinistry(reloaded);
    }
    async remove(id) {
        const ministry = await this.loadMinistryOrFail(id);
        await this.ministriesRepository.remove(ministry);
        return { id };
    }
    async loadMinistryOrFail(id) {
        const ministry = await this.ministriesRepository.findOne({
            where: { id },
            relations: {
                leader: true,
                presbyter: true,
                memberships: {
                    user: true
                }
            }
        });
        if (!ministry) {
            throw new common_1.HttpException('Ministério não encontrado.', common_1.HttpStatus.NOT_FOUND);
        }
        return ministry;
    }
    async replaceMembers(ministryId, memberIds) {
        await this.ministryMembersRepository.delete({ ministryId });
        if (memberIds.length === 0)
            return;
        const memberships = memberIds.map((userId) => this.ministryMembersRepository.create({ ministryId, userId }));
        await this.ministryMembersRepository.save(memberships);
    }
    async validateActiveMembers(userIds, roleLabel) {
        const uniqueIds = normalizeIdList(userIds);
        if (uniqueIds.length === 0)
            return;
        const users = await this.usersRepository.find({
            where: { id: (0, typeorm_2.In)(uniqueIds) }
        });
        if (users.length !== uniqueIds.length) {
            const foundIds = new Set(users.map((user) => user.id));
            const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
            throw new common_1.HttpException(`${roleLabel}(es) não encontrado(s): ${missingIds.join(', ')}.`, common_1.HttpStatus.BAD_REQUEST);
        }
        const invalidUsers = users.filter((user) => !isActiveMember(user)).map((user) => user.id);
        if (invalidUsers.length > 0) {
            throw new common_1.HttpException(`${roleLabel}(es) precisa(m) ser membro(s) ativo(s). IDs inválidos: ${invalidUsers.join(', ')}.`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async assertNameAvailable(name, ignoreMinistryId) {
        const where = ignoreMinistryId
            ? { name, id: (0, typeorm_2.Not)(ignoreMinistryId) }
            : { name };
        const existing = await this.ministriesRepository.findOne({ where });
        if (existing) {
            throw new common_1.HttpException('Já existe um ministério com este nome.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    mapMinistry(ministry) {
        var _a, _b, _c, _d;
        const sortedMemberships = [...(ministry.memberships || [])].sort((a, b) => a.userId - b.userId);
        const members = sortedMemberships.map((membership) => {
            var _a, _b;
            return ({
                user_id: membership.userId,
                full_name: `${((_a = membership.user) === null || _a === void 0 ? void 0 : _a.firstName) || ''} ${((_b = membership.user) === null || _b === void 0 ? void 0 : _b.lastName) || ''}`.trim()
            });
        });
        return {
            id: ministry.id,
            name: ministry.name,
            category: ministry.category || null,
            description: ministry.description || null,
            is_active: ministry.isActive,
            leader_user_id: ministry.leaderUserId || null,
            leader_name: ministry.leader && (ministry.leader.firstName || ministry.leader.lastName)
                ? `${ministry.leader.firstName} ${ministry.leader.lastName}`.trim()
                : null,
            presbyter_user_id: ministry.presbyterUserId || null,
            presbyter_name: ministry.presbyter && (ministry.presbyter.firstName || ministry.presbyter.lastName)
                ? `${ministry.presbyter.firstName} ${ministry.presbyter.lastName}`.trim()
                : null,
            member_user_ids: members.map((member) => member.user_id),
            members_count: members.length,
            members,
            created_at: ((_b = (_a = ministry.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) || null,
            updated_at: ((_d = (_c = ministry.updatedAt) === null || _c === void 0 ? void 0 : _c.toISOString) === null || _d === void 0 ? void 0 : _d.call(_c)) || null
        };
    }
};
exports.MinistriesService = MinistriesService;
exports.MinistriesService = MinistriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ministry_entity_1.Ministry)),
    __param(1, (0, typeorm_1.InjectRepository)(ministry_member_entity_1.MinistryMember)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MinistriesService);
//# sourceMappingURL=ministries.service.js.map