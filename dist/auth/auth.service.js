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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcryptjs");
const typeorm_2 = require("typeorm");
const roles_enum_1 = require("../common/constants/roles.enum");
const user_entity_1 = require("../entities/user.entity");
const mapUserToResponse = (user) => {
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
        person_type: user.personType || (normalizeRole(user.role) === roles_enum_1.Role.NON_MEMBER ? 'Visitante' : 'Membro'),
        member_status: (_p = user.memberStatus) !== null && _p !== void 0 ? _p : null,
        church_entry_date: (_q = user.churchEntryDate) !== null && _q !== void 0 ? _q : null,
        church_origin: (_r = user.churchOrigin) !== null && _r !== void 0 ? _r : null,
        internal_notes: (_s = user.internalNotes) !== null && _s !== void 0 ? _s : null,
        birth_date: user.birthDate,
        created_at: ((_u = (_t = user.createdAt) === null || _t === void 0 ? void 0 : _t.toISOString) === null || _u === void 0 ? void 0 : _u.call(_t)) || null,
        updated_at: ((_w = (_v = user.updatedAt) === null || _v === void 0 ? void 0 : _v.toISOString) === null || _w === void 0 ? void 0 : _w.call(_v)) || null,
        role: user.role || roles_enum_1.Role.MEMBER,
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
const normalizeRole = (incomingRole) => {
    if (!incomingRole)
        return roles_enum_1.Role.MEMBER;
    const normalized = incomingRole.trim().toLowerCase();
    if (normalized === 'administrador')
        return roles_enum_1.Role.ADMIN;
    if (normalized === 'membro')
        return roles_enum_1.Role.MEMBER;
    if (normalized === 'não membro' || normalized === 'nao membro')
        return roles_enum_1.Role.NON_MEMBER;
    return roles_enum_1.Role.MEMBER;
};
const isAdminRole = (incomingRole) => normalizeRole(incomingRole) === roles_enum_1.Role.ADMIN;
const normalizePersonType = (incoming, role) => {
    if ((incoming === null || incoming === void 0 ? void 0 : incoming.trim().toLowerCase()) === 'membro')
        return 'Membro';
    if ((incoming === null || incoming === void 0 ? void 0 : incoming.trim().toLowerCase()) === 'visitante')
        return 'Visitante';
    return normalizeRole(role) === roles_enum_1.Role.NON_MEMBER ? 'Visitante' : 'Membro';
};
const safeTrim = (value) => (value === null || value === void 0 ? void 0 : value.trim()) || null;
let AuthService = class AuthService {
    constructor(usersRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
    }
    async register(data) {
        var _a, _b, _c, _d, _e, _f, _g;
        const missingFields = ['first_name', 'last_name', 'birth_date', 'email', 'password'].filter((field) => {
            const value = data[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missingFields.length > 0) {
            throw new common_1.HttpException(`Campos obrigatórios não informados: ${missingFields.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        const normalizedEmail = data.email.trim().toLowerCase();
        const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            throw new common_1.HttpException('E-mail já cadastrado.', common_1.HttpStatus.CONFLICT);
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const role = normalizeRole(data.role);
        const user = this.usersRepository.create({
            firstName: data.first_name.trim(),
            lastName: data.last_name.trim(),
            birthDate: data.birth_date,
            email: normalizedEmail,
            phone: safeTrim(data.phone),
            secondaryPhone: safeTrim(data.secondary_phone),
            socialName: safeTrim(data.social_name),
            gender: safeTrim(data.gender),
            maritalStatus: safeTrim(data.marital_status),
            cpf: safeTrim(data.cpf),
            rgNumber: safeTrim(data.rg_number),
            rgIssuer: safeTrim(data.rg_issuer),
            rgState: safeTrim(data.rg_state),
            baptismDate: safeTrim(data.baptism_date),
            professionFaithDate: safeTrim(data.profession_faith_date),
            emergencyContactName: safeTrim(data.emergency_contact_name),
            emergencyContactPhone: safeTrim(data.emergency_contact_phone),
            personType: normalizePersonType(data.person_type, data.role),
            memberStatus: safeTrim(data.member_status),
            churchEntryDate: safeTrim(data.church_entry_date),
            churchOrigin: safeTrim(data.church_origin),
            internalNotes: safeTrim(data.internal_notes),
            role,
            passwordHash,
            addressStreet: safeTrim((_a = data.address) === null || _a === void 0 ? void 0 : _a.street),
            addressNumber: safeTrim((_b = data.address) === null || _b === void 0 ? void 0 : _b.number),
            addressDistrict: safeTrim((_c = data.address) === null || _c === void 0 ? void 0 : _c.district),
            addressCity: safeTrim((_d = data.address) === null || _d === void 0 ? void 0 : _d.city),
            addressState: safeTrim((_e = data.address) === null || _e === void 0 ? void 0 : _e.state),
            addressZip: safeTrim((_f = data.address) === null || _f === void 0 ? void 0 : _f.zip),
            addressComplement: safeTrim((_g = data.address) === null || _g === void 0 ? void 0 : _g.complement)
        });
        const saved = await this.usersRepository.save(user);
        return mapUserToResponse(saved);
    }
    async login({ email, password }) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.usersRepository.findOne({
            where: { email: normalizedEmail },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'phone',
                'secondaryPhone',
                'socialName',
                'gender',
                'maritalStatus',
                'cpf',
                'rgNumber',
                'rgIssuer',
                'rgState',
                'baptismDate',
                'professionFaithDate',
                'emergencyContactName',
                'emergencyContactPhone',
                'personType',
                'memberStatus',
                'churchEntryDate',
                'churchOrigin',
                'internalNotes',
                'birthDate',
                'createdAt',
                'updatedAt',
                'role',
                'passwordHash',
                'addressStreet',
                'addressNumber',
                'addressDistrict',
                'addressCity',
                'addressState',
                'addressZip',
                'addressComplement'
            ]
        });
        if (!user) {
            throw new common_1.HttpException('Credenciais inválidas.', common_1.HttpStatus.UNAUTHORIZED);
        }
        const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordIsValid) {
            throw new common_1.HttpException('Credenciais inválidas.', common_1.HttpStatus.UNAUTHORIZED);
        }
        const payload = {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            role: user.role || roles_enum_1.Role.MEMBER
        };
        const token = await this.jwtService.signAsync(payload);
        return { token, user: mapUserToResponse(user) };
    }
    async loginAdmin(data) {
        const result = await this.login(data);
        if (!isAdminRole(result.user.role)) {
            throw new common_1.HttpException('Acesso restrito: somente administradores podem acessar o painel web.', common_1.HttpStatus.FORBIDDEN);
        }
        return result;
    }
    async currentUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.HttpException('Usuário não encontrado.', common_1.HttpStatus.NOT_FOUND);
        }
        return mapUserToResponse(user);
    }
    async updateProfile(userId, data) {
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
        return mapUserToResponse(saved);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map