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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const roles_enum_1 = require("../common/constants/roles.enum");
const user_entity_1 = require("../entities/user.entity");
const ministry_entity_1 = require("../entities/ministry.entity");
const ministry_member_entity_1 = require("../entities/ministry-member.entity");
const mapUser = (user, ministries = []) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    return ({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        social_name: (_a = user.socialName) !== null && _a !== void 0 ? _a : null,
        email: user.email,
        phone: (_b = user.phone) !== null && _b !== void 0 ? _b : null,
        secondary_phone: (_c = user.secondaryPhone) !== null && _c !== void 0 ? _c : null,
        gender: (_d = user.gender) !== null && _d !== void 0 ? _d : null,
        marital_status: (_e = user.maritalStatus) !== null && _e !== void 0 ? _e : null,
        cpf: (_f = user.cpf) !== null && _f !== void 0 ? _f : null,
        rg_number: (_g = user.rgNumber) !== null && _g !== void 0 ? _g : null,
        rg_issuer: (_h = user.rgIssuer) !== null && _h !== void 0 ? _h : null,
        rg_state: (_j = user.rgState) !== null && _j !== void 0 ? _j : null,
        baptism_date: (_k = user.baptismDate) !== null && _k !== void 0 ? _k : null,
        profession_faith_date: (_l = user.professionFaithDate) !== null && _l !== void 0 ? _l : null,
        emergency_contact_name: (_m = user.emergencyContactName) !== null && _m !== void 0 ? _m : null,
        emergency_contact_phone: (_o = user.emergencyContactPhone) !== null && _o !== void 0 ? _o : null,
        person_type: user.personType || (user.role === roles_enum_1.Role.NON_MEMBER ? 'Visitante' : 'Membro'),
        member_status: (_p = user.memberStatus) !== null && _p !== void 0 ? _p : null,
        church_entry_date: (_q = user.churchEntryDate) !== null && _q !== void 0 ? _q : null,
        church_origin: (_r = user.churchOrigin) !== null && _r !== void 0 ? _r : null,
        internal_notes: (_s = user.internalNotes) !== null && _s !== void 0 ? _s : null,
        birth_date: user.birthDate,
        created_at: ((_u = (_t = user.createdAt) === null || _t === void 0 ? void 0 : _t.toISOString) === null || _u === void 0 ? void 0 : _u.call(_t)) || null,
        updated_at: ((_w = (_v = user.updatedAt) === null || _v === void 0 ? void 0 : _v.toISOString) === null || _w === void 0 ? void 0 : _w.call(_v)) || null,
        role: user.role || roles_enum_1.Role.MEMBER,
        ministries,
        address: user.addressStreet ||
            user.addressNumber ||
            user.addressDistrict ||
            user.addressCity ||
            user.addressState ||
            user.addressZip ||
            user.addressComplement
            ? {
                street: user.addressStreet || null,
                number: user.addressNumber || null,
                district: user.addressDistrict || null,
                city: user.addressCity || null,
                state: user.addressState || null,
                zip: user.addressZip || null,
                complement: user.addressComplement || null
            }
            : null
    });
};
const safeTrim = (value) => (value === null || value === void 0 ? void 0 : value.trim()) || null;
let UsersService = class UsersService {
    constructor(usersRepository, ministriesRepository, ministryMembersRepository) {
        this.usersRepository = usersRepository;
        this.ministriesRepository = ministriesRepository;
        this.ministryMembersRepository = ministryMembersRepository;
    }
    async listMembers() {
        const users = await this.usersRepository.find({
            order: { firstName: 'ASC', lastName: 'ASC' }
        });
        const ministriesByUserId = await this.getMinistryLinksByUserIds(users.map((user) => user.id));
        return users.map((user) => mapUser(user, ministriesByUserId.get(user.id) || []));
    }
    async findMemberById(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.HttpException('Usuário não encontrado.', common_1.HttpStatus.NOT_FOUND);
        }
        const ministriesByUserId = await this.getMinistryLinksByUserIds([user.id]);
        return mapUser(user, ministriesByUserId.get(user.id) || []);
    }
    async updateMemberRole(userId, { role }) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.HttpException('Usuário não encontrado.', common_1.HttpStatus.NOT_FOUND);
        }
        user.role = role;
        const saved = await this.usersRepository.save(user);
        const ministriesByUserId = await this.getMinistryLinksByUserIds([saved.id]);
        return mapUser(saved, ministriesByUserId.get(saved.id) || []);
    }
    async updateMember(userId, data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.HttpException('Usuário não encontrado.', common_1.HttpStatus.NOT_FOUND);
        }
        const updates = {
            firstName: (_a = safeTrim(data.first_name)) !== null && _a !== void 0 ? _a : user.firstName,
            lastName: (_b = safeTrim(data.last_name)) !== null && _b !== void 0 ? _b : user.lastName,
            birthDate: (_c = safeTrim(data.birth_date)) !== null && _c !== void 0 ? _c : user.birthDate,
            email: (_d = safeTrim(data.email)) !== null && _d !== void 0 ? _d : user.email,
            phone: (_e = safeTrim(data.phone)) !== null && _e !== void 0 ? _e : user.phone,
            secondaryPhone: (_f = safeTrim(data.secondary_phone)) !== null && _f !== void 0 ? _f : user.secondaryPhone,
            socialName: (_g = safeTrim(data.social_name)) !== null && _g !== void 0 ? _g : user.socialName,
            gender: (_h = safeTrim(data.gender)) !== null && _h !== void 0 ? _h : user.gender,
            maritalStatus: (_j = safeTrim(data.marital_status)) !== null && _j !== void 0 ? _j : user.maritalStatus,
            cpf: (_k = safeTrim(data.cpf)) !== null && _k !== void 0 ? _k : user.cpf,
            rgNumber: (_l = safeTrim(data.rg_number)) !== null && _l !== void 0 ? _l : user.rgNumber,
            rgIssuer: (_m = safeTrim(data.rg_issuer)) !== null && _m !== void 0 ? _m : user.rgIssuer,
            rgState: (_o = safeTrim(data.rg_state)) !== null && _o !== void 0 ? _o : user.rgState,
            baptismDate: (_p = safeTrim(data.baptism_date)) !== null && _p !== void 0 ? _p : user.baptismDate,
            professionFaithDate: (_q = safeTrim(data.profession_faith_date)) !== null && _q !== void 0 ? _q : user.professionFaithDate,
            emergencyContactName: (_r = safeTrim(data.emergency_contact_name)) !== null && _r !== void 0 ? _r : user.emergencyContactName,
            emergencyContactPhone: (_s = safeTrim(data.emergency_contact_phone)) !== null && _s !== void 0 ? _s : user.emergencyContactPhone,
            personType: (_t = safeTrim(data.person_type)) !== null && _t !== void 0 ? _t : user.personType,
            memberStatus: (_u = safeTrim(data.member_status)) !== null && _u !== void 0 ? _u : user.memberStatus,
            churchEntryDate: (_v = safeTrim(data.church_entry_date)) !== null && _v !== void 0 ? _v : user.churchEntryDate,
            churchOrigin: (_w = safeTrim(data.church_origin)) !== null && _w !== void 0 ? _w : user.churchOrigin,
            internalNotes: (_x = safeTrim(data.internal_notes)) !== null && _x !== void 0 ? _x : user.internalNotes,
            addressStreet: (_z = safeTrim((_y = data.address) === null || _y === void 0 ? void 0 : _y.street)) !== null && _z !== void 0 ? _z : user.addressStreet,
            addressNumber: (_1 = safeTrim((_0 = data.address) === null || _0 === void 0 ? void 0 : _0.number)) !== null && _1 !== void 0 ? _1 : user.addressNumber,
            addressDistrict: (_3 = safeTrim((_2 = data.address) === null || _2 === void 0 ? void 0 : _2.district)) !== null && _3 !== void 0 ? _3 : user.addressDistrict,
            addressCity: (_5 = safeTrim((_4 = data.address) === null || _4 === void 0 ? void 0 : _4.city)) !== null && _5 !== void 0 ? _5 : user.addressCity,
            addressState: (_7 = safeTrim((_6 = data.address) === null || _6 === void 0 ? void 0 : _6.state)) !== null && _7 !== void 0 ? _7 : user.addressState,
            addressZip: (_9 = safeTrim((_8 = data.address) === null || _8 === void 0 ? void 0 : _8.zip)) !== null && _9 !== void 0 ? _9 : user.addressZip,
            addressComplement: (_11 = safeTrim((_10 = data.address) === null || _10 === void 0 ? void 0 : _10.complement)) !== null && _11 !== void 0 ? _11 : user.addressComplement
        };
        const saved = await this.usersRepository.save(Object.assign(Object.assign({}, user), updates));
        const ministriesByUserId = await this.getMinistryLinksByUserIds([saved.id]);
        return mapUser(saved, ministriesByUserId.get(saved.id) || []);
    }
    async deactivateMember(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.HttpException('Usuário não encontrado.', common_1.HttpStatus.NOT_FOUND);
        }
        user.memberStatus = 'Inativo';
        const saved = await this.usersRepository.save(user);
        const ministriesByUserId = await this.getMinistryLinksByUserIds([saved.id]);
        return mapUser(saved, ministriesByUserId.get(saved.id) || []);
    }
    async getMinistryLinksByUserIds(userIds) {
        const uniqueUserIds = Array.from(new Set(userIds.filter((id) => Number.isInteger(id) && id > 0)));
        const map = new Map();
        if (uniqueUserIds.length === 0)
            return map;
        const [ledMinistries, memberships] = await Promise.all([
            this.ministriesRepository.find({
                where: { leaderUserId: (0, typeorm_2.In)(uniqueUserIds) },
                order: { name: 'ASC' }
            }),
            this.ministryMembersRepository.find({
                where: { userId: (0, typeorm_2.In)(uniqueUserIds) },
                relations: { ministry: true },
                order: { ministry: { name: 'ASC' } }
            })
        ]);
        const pushLink = (userId, link) => {
            const current = map.get(userId) || [];
            const exists = current.some((item) => item.ministry_id === link.ministry_id);
            if (!exists) {
                current.push(link);
            }
            map.set(userId, current);
        };
        for (const ministry of ledMinistries) {
            if (!ministry.leaderUserId)
                continue;
            pushLink(ministry.leaderUserId, {
                ministry_id: ministry.id,
                ministry_name: ministry.name,
                role: 'Líder',
                is_active: ministry.isActive
            });
        }
        for (const membership of memberships) {
            if (!membership.ministry)
                continue;
            pushLink(membership.userId, {
                ministry_id: membership.ministry.id,
                ministry_name: membership.ministry.name,
                role: 'Membro',
                is_active: membership.ministry.isActive
            });
        }
        for (const [userId, links] of map.entries()) {
            links.sort((a, b) => a.ministry_name.localeCompare(b.ministry_name, 'pt-BR'));
            map.set(userId, links);
        }
        return map;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(ministry_entity_1.Ministry)),
    __param(2, (0, typeorm_1.InjectRepository)(ministry_member_entity_1.MinistryMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map