import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { In, Repository } from 'typeorm';
import { Role } from '../common/constants/roles.enum';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Ministry } from '../entities/ministry.entity';
import { MinistryMember } from '../entities/ministry-member.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

type UserMinistryLink = {
  ministry_id: number;
  ministry_name: string;
  role: 'Líder' | 'Membro';
  is_active: boolean;
};

type PasswordHistoryRow = {
  id: number;
  user_id: number;
  admin_user_id: number | null;
  mode: 'auto' | 'manual';
  send_email: number;
  changed_at: Date | string;
  admin_name: string | null;
};

const mapUser = (user: User, ministries: UserMinistryLink[] = []) => ({
  id: user.id,
  first_name: user.firstName,
  last_name: user.lastName,
  social_name: user.socialName ?? null,
  email: user.email,
  phone: user.phone ?? null,
  secondary_phone: user.secondaryPhone ?? null,
  gender: user.gender ?? null,
  marital_status: user.maritalStatus ?? null,
  cpf: user.cpf ?? null,
  rg_number: user.rgNumber ?? null,
  rg_issuer: user.rgIssuer ?? null,
  rg_state: user.rgState ?? null,
  baptism_date: user.baptismDate ?? null,
  profession_faith_date: user.professionFaithDate ?? null,
  emergency_contact_name: user.emergencyContactName ?? null,
  emergency_contact_phone: user.emergencyContactPhone ?? null,
  person_type: user.personType || (user.role === Role.NON_MEMBER ? 'Visitante' : 'Membro'),
  member_status: user.memberStatus ?? null,
  church_entry_date: user.churchEntryDate ?? null,
  church_origin: user.churchOrigin ?? null,
  internal_notes: user.internalNotes ?? null,
  birth_date: user.birthDate,
  created_at: user.createdAt?.toISOString?.() || null,
  updated_at: user.updatedAt?.toISOString?.() || null,
  role: user.role || Role.MEMBER,
  ministries,
  address:
    user.addressStreet ||
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

const safeTrim = (value?: string | null) => value?.trim() || null;
const normalizeRole = (incomingRole?: string) => {
  if (!incomingRole) return Role.MEMBER;

  const normalized = incomingRole.trim().toLowerCase();
  if (normalized === 'administrador') return Role.ADMIN;
  if (normalized === 'membro') return Role.MEMBER;
  if (normalized === 'não membro' || normalized === 'nao membro') return Role.NON_MEMBER;

  return Role.MEMBER;
};

const normalizePersonType = (incoming?: string, role?: string) => {
  if (incoming?.trim().toLowerCase() === 'membro') return 'Membro';
  if (incoming?.trim().toLowerCase() === 'visitante') return 'Visitante';
  return normalizeRole(role) === Role.NON_MEMBER ? 'Visitante' : 'Membro';
};

const generateTemporaryPassword = (length = 10) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

const ensurePasswordHistoryTableSql = `
  CREATE TABLE IF NOT EXISTS user_password_history (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    admin_user_id INT UNSIGNED NULL,
    mode VARCHAR(20) NOT NULL,
    send_email TINYINT(1) NOT NULL DEFAULT 0,
    changed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_user_password_history PRIMARY KEY (id),
    CONSTRAINT fk_user_password_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_password_history_admin FOREIGN KEY (admin_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_user_password_history_user_id (user_id),
    INDEX idx_user_password_history_admin_user_id (admin_user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Ministry)
    private readonly ministriesRepository: Repository<Ministry>,
    @InjectRepository(MinistryMember)
    private readonly ministryMembersRepository: Repository<MinistryMember>
  ) {}

  async listMembers() {
    const users = await this.usersRepository.find({
      order: { firstName: 'ASC', lastName: 'ASC' }
    });

    const ministriesByUserId = await this.getMinistryLinksByUserIds(users.map((user) => user.id));
    return users.map((user) => mapUser(user, ministriesByUserId.get(user.id) || []));
  }

  async findMemberById(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    const ministriesByUserId = await this.getMinistryLinksByUserIds([user.id]);
    return mapUser(user, ministriesByUserId.get(user.id) || []);
  }

  async createMember(data: CreateUserDto) {
    const missingFields = ['first_name', 'last_name', 'birth_date', 'email'].filter((field) => {
      const value = (data as unknown as Record<string, unknown>)[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missingFields.length > 0) {
      throw new HttpException(
        `Campos obrigatórios não informados: ${missingFields.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new HttpException('E-mail já cadastrado.', HttpStatus.CONFLICT);
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const created = this.usersRepository.create({
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
      role: normalizeRole(data.role),
      passwordHash,
      addressStreet: safeTrim(data.address?.street),
      addressNumber: safeTrim(data.address?.number),
      addressDistrict: safeTrim(data.address?.district),
      addressCity: safeTrim(data.address?.city),
      addressState: safeTrim(data.address?.state),
      addressZip: safeTrim(data.address?.zip),
      addressComplement: safeTrim(data.address?.complement)
    });

    const saved = await this.usersRepository.save(created);
    const ministriesByUserId = await this.getMinistryLinksByUserIds([saved.id]);

    return {
      user: mapUser(saved, ministriesByUserId.get(saved.id) || []),
      temporaryPassword
    };
  }

  async updateMemberRole(userId: number, { role }: UpdateRoleDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    user.role = role;
    const saved = await this.usersRepository.save(user);
    const ministriesByUserId = await this.getMinistryLinksByUserIds([saved.id]);
    return mapUser(saved, ministriesByUserId.get(saved.id) || []);
  }

  async updateMember(userId: number, data: UpdateProfileDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    const updates: Partial<User> = {
      firstName: safeTrim(data.first_name) ?? user.firstName,
      lastName: safeTrim(data.last_name) ?? user.lastName,
      birthDate: safeTrim(data.birth_date) ?? user.birthDate,
      email: safeTrim(data.email) ?? user.email,
      phone: safeTrim(data.phone) ?? user.phone,
      secondaryPhone: safeTrim(data.secondary_phone) ?? user.secondaryPhone,
      socialName: safeTrim(data.social_name) ?? user.socialName,
      gender: safeTrim(data.gender) ?? user.gender,
      maritalStatus: safeTrim(data.marital_status) ?? user.maritalStatus,
      cpf: safeTrim(data.cpf) ?? user.cpf,
      rgNumber: safeTrim(data.rg_number) ?? user.rgNumber,
      rgIssuer: safeTrim(data.rg_issuer) ?? user.rgIssuer,
      rgState: safeTrim(data.rg_state) ?? user.rgState,
      baptismDate: safeTrim(data.baptism_date) ?? user.baptismDate,
      professionFaithDate: safeTrim(data.profession_faith_date) ?? user.professionFaithDate,
      emergencyContactName: safeTrim(data.emergency_contact_name) ?? user.emergencyContactName,
      emergencyContactPhone: safeTrim(data.emergency_contact_phone) ?? user.emergencyContactPhone,
      personType: safeTrim(data.person_type) ?? user.personType,
      memberStatus: safeTrim(data.member_status) ?? user.memberStatus,
      churchEntryDate: safeTrim(data.church_entry_date) ?? user.churchEntryDate,
      churchOrigin: safeTrim(data.church_origin) ?? user.churchOrigin,
      internalNotes: safeTrim(data.internal_notes) ?? user.internalNotes,
      addressStreet: safeTrim(data.address?.street) ?? user.addressStreet,
      addressNumber: safeTrim(data.address?.number) ?? user.addressNumber,
      addressDistrict: safeTrim(data.address?.district) ?? user.addressDistrict,
      addressCity: safeTrim(data.address?.city) ?? user.addressCity,
      addressState: safeTrim(data.address?.state) ?? user.addressState,
      addressZip: safeTrim(data.address?.zip) ?? user.addressZip,
      addressComplement: safeTrim(data.address?.complement) ?? user.addressComplement
    };

    const saved = await this.usersRepository.save({
      ...user,
      ...updates
    });

    const ministriesByUserId = await this.getMinistryLinksByUserIds([saved.id]);
    return mapUser(saved, ministriesByUserId.get(saved.id) || []);
  }

  async deactivateMember(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    user.memberStatus = 'Inativo';
    const saved = await this.usersRepository.save(user);
    const ministriesByUserId = await this.getMinistryLinksByUserIds([saved.id]);
    return mapUser(saved, ministriesByUserId.get(saved.id) || []);
  }

  async updateMemberPassword(userId: number, data: UpdatePasswordDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    let plainPassword: string;

    if (data.mode === 'manual') {
      const manualPassword = data.password?.trim();
      if (!manualPassword) {
        throw new HttpException('Senha é obrigatória no modo manual.', HttpStatus.BAD_REQUEST);
      }
      plainPassword = manualPassword;
    } else {
      plainPassword = generateTemporaryPassword();
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await this.usersRepository.update(userId, { passwordHash });

    return {
      mode: data.mode,
      temporaryPassword: data.mode === 'auto' ? plainPassword : null,
      emailSent: false
    };
  }

  async updateMemberPasswordWithHistory(
    userId: number,
    adminUserId: number | null,
    data: UpdatePasswordDto
  ) {
    const result = await this.updateMemberPassword(userId, data);

    await this.usersRepository.query(ensurePasswordHistoryTableSql);
    await this.usersRepository.query(
      `
        INSERT INTO user_password_history (user_id, admin_user_id, mode, send_email)
        VALUES (?, ?, ?, ?)
      `,
      [userId, adminUserId, data.mode, data.send_email ? 1 : 0]
    );

    return result;
  }

  async listMemberPasswordHistory(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    await this.usersRepository.query(ensurePasswordHistoryTableSql);
    const rows = (await this.usersRepository.query(
      `
        SELECT
          h.id,
          h.user_id,
          h.admin_user_id,
          h.mode,
          h.send_email,
          h.changed_at,
          CASE
            WHEN a.id IS NULL THEN NULL
            ELSE CONCAT(a.first_name, ' ', a.last_name)
          END AS admin_name
        FROM user_password_history h
        LEFT JOIN users a ON a.id = h.admin_user_id
        WHERE h.user_id = ?
        ORDER BY h.changed_at DESC
      `,
      [userId]
    )) as PasswordHistoryRow[];

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      admin_user_id: row.admin_user_id,
      admin_name: row.admin_name || 'Administrador',
      mode: row.mode,
      send_email: Boolean(row.send_email),
      changed_at:
        typeof row.changed_at === 'string'
          ? row.changed_at
          : row.changed_at?.toISOString?.() || null
    }));
  }

  async getMemberWhatsAppLink(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    const rawPhone = `${user.phone || user.secondaryPhone || ''}`.replace(/\D/g, '');
    if (!rawPhone) {
      throw new HttpException('Usuário não possui telefone cadastrado.', HttpStatus.BAD_REQUEST);
    }

    let normalized = rawPhone.replace(/^0+/, '');
    if (!normalized.startsWith('55')) {
      normalized = `55${normalized}`;
    }

    return {
      phone: normalized,
      whatsapp_url: `https://web.whatsapp.com/send?phone=${normalized}`
    };
  }

  private async getMinistryLinksByUserIds(userIds: number[]) {
    const uniqueUserIds = Array.from(new Set(userIds.filter((id) => Number.isInteger(id) && id > 0)));
    const map = new Map<number, UserMinistryLink[]>();

    if (uniqueUserIds.length === 0) return map;

    const [ledMinistries, memberships] = await Promise.all([
      this.ministriesRepository.find({
        where: { leaderUserId: In(uniqueUserIds) },
        order: { name: 'ASC' }
      }),
      this.ministryMembersRepository.find({
        where: { userId: In(uniqueUserIds) },
        relations: { ministry: true },
        order: { ministry: { name: 'ASC' } }
      })
    ]);

    const pushLink = (userId: number, link: UserMinistryLink) => {
      const current = map.get(userId) || [];
      const exists = current.some((item) => item.ministry_id === link.ministry_id);
      if (!exists) {
        current.push(link);
      }
      map.set(userId, current);
    };

    for (const ministry of ledMinistries) {
      if (!ministry.leaderUserId) continue;

      pushLink(ministry.leaderUserId, {
        ministry_id: ministry.id,
        ministry_name: ministry.name,
        role: 'Líder',
        is_active: ministry.isActive
      });
    }

    for (const membership of memberships) {
      if (!membership.ministry) continue;

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
}
