import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/constants/roles.enum';
import { User } from '../entities/user.entity';

const normalize = (value?: string | null) => (value || '').trim().toLowerCase();

const isMember = (user: User) => {
  const personType = normalize(user.personType);
  if (personType === 'membro') return true;
  if (personType === 'visitante') return false;
  return normalize(user.role) !== normalize(Role.NON_MEMBER);
};

const isActiveMember = (user: User) =>
  isMember(user) && normalize(user.memberStatus) === 'ativo';

const birthMonthDay = (birthDate?: string | Date | null) => {
  if (!birthDate) return null;
  if (typeof birthDate === 'string') {
    const match = birthDate.match(/^\d{4}-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}`;
  }

  const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const getWeekMonthDays = (baseDate: Date) => {
  const current = new Date(baseDate);
  const day = current.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(current);
  weekStart.setDate(current.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const monthDays = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    monthDays.add(`${month}-${dayOfMonth}`);
  }

  return monthDays;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

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
}
