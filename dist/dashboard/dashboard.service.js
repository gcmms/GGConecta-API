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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const roles_enum_1 = require("../common/constants/roles.enum");
const user_entity_1 = require("../entities/user.entity");
const normalize = (value) => (value || '').trim().toLowerCase();
const isMember = (user) => {
    const personType = normalize(user.personType);
    if (personType === 'membro')
        return true;
    if (personType === 'visitante')
        return false;
    return normalize(user.role) !== normalize(roles_enum_1.Role.NON_MEMBER);
};
const isActiveMember = (user) => isMember(user) && normalize(user.memberStatus) === 'ativo';
const birthMonthDay = (birthDate) => {
    if (!birthDate)
        return null;
    if (typeof birthDate === 'string') {
        const match = birthDate.match(/^\d{4}-(\d{2})-(\d{2})/);
        if (match)
            return `${match[1]}-${match[2]}`;
    }
    const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (Number.isNaN(date.getTime()))
        return null;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
};
const getWeekMonthDays = (baseDate) => {
    const current = new Date(baseDate);
    const day = current.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(current);
    weekStart.setDate(current.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const monthDays = new Set();
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(d.getDate()).padStart(2, '0');
        monthDays.add(`${month}-${dayOfMonth}`);
    }
    return monthDays;
};
let DashboardService = class DashboardService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async overview() {
        const users = await this.usersRepository.find({
            select: ['id', 'birthDate', 'personType', 'memberStatus', 'role']
        });
        const weekMonthDays = getWeekMonthDays(new Date());
        const membrosAtivos = users.filter(isActiveMember).length;
        const visitantes = users.filter((user) => !isMember(user)).length;
        const aniversariantesSemana = users.filter((user) => {
            const md = birthMonthDay(user.birthDate);
            return !!md && weekMonthDays.has(md);
        }).length;
        return {
            membros_ativos: membrosAtivos,
            visitantes,
            aniversariantes_semana: aniversariantesSemana
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map