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
exports.BirthdaysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const pad = (value) => String(value).padStart(2, '0');
const isValidMonthDay = (month, day) => {
    if (month < 1 || month > 12 || day < 1 || day > 31)
        return false;
    const date = new Date(Date.UTC(2000, month - 1, day));
    return date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
};
const extractMonthDay = (input) => {
    if (!input)
        return null;
    if (typeof input === 'string') {
        const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match)
            return `${match[2]}-${match[3]}`;
    }
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime()))
        return null;
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const normalizeMonthDayInput = (raw) => {
    const value = raw.trim();
    const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
        const month = Number(isoMatch[2]);
        const day = Number(isoMatch[3]);
        if (!isValidMonthDay(month, day))
            return null;
        return `${pad(month)}-${pad(day)}`;
    }
    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (slashMatch) {
        const day = Number(slashMatch[1]);
        const month = Number(slashMatch[2]);
        if (!isValidMonthDay(month, day))
            return null;
        return `${pad(month)}-${pad(day)}`;
    }
    const dashMatch = value.match(/^(\d{1,2})-(\d{1,2})$/);
    if (dashMatch) {
        const month = Number(dashMatch[1]);
        const day = Number(dashMatch[2]);
        if (!isValidMonthDay(month, day))
            return null;
        return `${pad(month)}-${pad(day)}`;
    }
    return null;
};
const inRange = (monthDay, range) => {
    if (range.from <= range.to) {
        return monthDay >= range.from && monthDay <= range.to;
    }
    return monthDay >= range.from || monthDay <= range.to;
};
const calculateAge = (birthDate) => {
    if (!birthDate)
        return null;
    const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (Number.isNaN(date.getTime()))
        return null;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const hasHadBirthdayThisYear = now.getMonth() > date.getMonth() ||
        (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
    if (!hasHadBirthdayThisYear)
        age -= 1;
    return age;
};
let BirthdaysService = class BirthdaysService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    getDefaultCurrentMonthRange() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const endDay = new Date(now.getFullYear(), month, 0).getDate();
        return {
            from: `${pad(month)}-01`,
            to: `${pad(month)}-${pad(endDay)}`
        };
    }
    resolveRange({ from, to }) {
        if (!from && !to) {
            return this.getDefaultCurrentMonthRange();
        }
        if (!from || !to) {
            throw new common_1.BadRequestException('Para filtrar por intervalo, envie os dois parâmetros: "from" e "to".');
        }
        const normalizedFrom = normalizeMonthDayInput(from);
        const normalizedTo = normalizeMonthDayInput(to);
        if (!normalizedFrom || !normalizedTo) {
            throw new common_1.BadRequestException('Formato inválido. Use MM-DD, DD/MM ou YYYY-MM-DD.');
        }
        return {
            from: normalizedFrom,
            to: normalizedTo
        };
    }
    async list(query) {
        const range = this.resolveRange(query);
        const users = await this.usersRepository.find({
            select: [
                'id',
                'firstName',
                'lastName',
                'birthDate',
                'phone',
                'personType',
                'memberStatus',
                'role'
            ]
        });
        const items = users
            .map((user) => {
            var _a, _b, _c;
            const monthDay = extractMonthDay(user.birthDate);
            if (!monthDay)
                return null;
            return {
                id: user.id,
                first_name: user.firstName,
                last_name: user.lastName,
                full_name: `${user.firstName} ${user.lastName}`.trim(),
                birth_date: user.birthDate,
                birth_month_day: monthDay,
                age: calculateAge(user.birthDate),
                phone: (_a = user.phone) !== null && _a !== void 0 ? _a : null,
                person_type: (_b = user.personType) !== null && _b !== void 0 ? _b : null,
                member_status: (_c = user.memberStatus) !== null && _c !== void 0 ? _c : null,
                role: user.role
            };
        })
            .filter((item) => !!item)
            .filter((item) => inRange(item.birth_month_day, range))
            .sort((a, b) => {
            if (a.birth_month_day !== b.birth_month_day) {
                return a.birth_month_day.localeCompare(b.birth_month_day);
            }
            return a.full_name.localeCompare(b.full_name);
        });
        return {
            range,
            total: items.length,
            items
        };
    }
};
exports.BirthdaysService = BirthdaysService;
exports.BirthdaysService = BirthdaysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BirthdaysService);
//# sourceMappingURL=birthdays.service.js.map