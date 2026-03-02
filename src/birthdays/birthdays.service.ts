import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ListBirthdaysQueryDto } from './dto/list-birthdays-query.dto';

type BirthdayRange = {
  from: string;
  to: string;
};

const pad = (value: number) => String(value).padStart(2, '0');

const isValidMonthDay = (month: number, day: number) => {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(2000, month - 1, day));
  return date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
};

const extractMonthDay = (input?: string | Date | null) => {
  if (!input) return null;
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[2]}-${match[3]}`;
  }

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const normalizeMonthDayInput = (raw: string) => {
  const value = raw.trim();

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isValidMonthDay(month, day)) return null;
    return `${pad(month)}-${pad(day)}`;
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    if (!isValidMonthDay(month, day)) return null;
    return `${pad(month)}-${pad(day)}`;
  }

  const dashMatch = value.match(/^(\d{1,2})-(\d{1,2})$/);
  if (dashMatch) {
    const month = Number(dashMatch[1]);
    const day = Number(dashMatch[2]);
    if (!isValidMonthDay(month, day)) return null;
    return `${pad(month)}-${pad(day)}`;
  }

  return null;
};

const inRange = (monthDay: string, range: BirthdayRange) => {
  if (range.from <= range.to) {
    return monthDay >= range.from && monthDay <= range.to;
  }

  return monthDay >= range.from || monthDay <= range.to;
};

const calculateAge = (birthDate: string | Date | null | undefined) => {
  if (!birthDate) return null;
  const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
};

@Injectable()
export class BirthdaysService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  private getDefaultCurrentMonthRange() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const endDay = new Date(now.getFullYear(), month, 0).getDate();
    return {
      from: `${pad(month)}-01`,
      to: `${pad(month)}-${pad(endDay)}`
    };
  }

  private resolveRange({ from, to }: ListBirthdaysQueryDto): BirthdayRange {
    if (!from && !to) {
      return this.getDefaultCurrentMonthRange();
    }

    if (!from || !to) {
      throw new BadRequestException(
        'Para filtrar por intervalo, envie os dois parâmetros: "from" e "to".'
      );
    }

    const normalizedFrom = normalizeMonthDayInput(from);
    const normalizedTo = normalizeMonthDayInput(to);

    if (!normalizedFrom || !normalizedTo) {
      throw new BadRequestException(
        'Formato inválido. Use MM-DD, DD/MM ou YYYY-MM-DD.'
      );
    }

    return {
      from: normalizedFrom,
      to: normalizedTo
    };
  }

  async list(query: ListBirthdaysQueryDto) {
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
        const monthDay = extractMonthDay(user.birthDate);
        if (!monthDay) return null;

        return {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          full_name: `${user.firstName} ${user.lastName}`.trim(),
          birth_date: user.birthDate,
          birth_month_day: monthDay,
          age: calculateAge(user.birthDate),
          phone: user.phone ?? null,
          person_type: user.personType ?? null,
          member_status: user.memberStatus ?? null,
          role: user.role
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item)
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
}
