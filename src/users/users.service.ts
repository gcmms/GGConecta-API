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
import { AccessProfile } from '../entities/access-profile.entity';
import { UpdateAccessSettingsDto } from './dto/update-access-settings.dto';
import { CreateUserTimelineEventDto } from './dto/create-user-timeline-event.dto';

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

type TimelineEventRow = {
  id: number;
  user_id: number;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string | Date;
  source: 'automatico' | 'manual';
  created_by_user_id: number | null;
  created_at: string | Date;
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
  access_profile_id: user.accessProfileId ?? null,
  access_profile:
    user.accessProfile && user.accessProfile.id
      ? {
          id: user.accessProfile.id,
          name: user.accessProfile.name,
          slug: user.accessProfile.slug
        }
      : null,
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

const toDateOnly = (value?: string | Date | null) => {
  if (!value) return null;
  const normalized = `${value}`;
  const match = normalized.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const toIsoString = (value?: string | Date | null) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }
  return value.toISOString?.() || null;
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

const ensureTimelineTableSql = `
  CREATE TABLE IF NOT EXISTS user_timeline_events (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    event_date DATE NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'automatico',
    created_by_user_id INT UNSIGNED NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_user_timeline_events PRIMARY KEY (id),
    CONSTRAINT fk_user_timeline_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_timeline_created_by FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_user_timeline_user_date (user_id, event_date),
    INDEX idx_user_timeline_source (source)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AccessProfile)
    private readonly accessProfilesRepository: Repository<AccessProfile>,
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
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { accessProfile: true }
    });
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
    await this.addAutomaticTimelineEvent({
      userId: saved.id,
      eventType: 'Cadastro',
      title: 'Cadastro realizado',
      description: 'Pessoa cadastrada no sistema.',
      eventDate: toDateOnly(saved.createdAt) || new Date().toISOString().slice(0, 10)
    });
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

  async getMemberAccessSettings(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { accessProfile: true }
    });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    return {
      user_id: user.id,
      role: user.role || Role.MEMBER,
      access_profile_id: user.accessProfileId ?? null,
      access_profile:
        user.accessProfile && user.accessProfile.id
          ? {
              id: user.accessProfile.id,
              name: user.accessProfile.name,
              slug: user.accessProfile.slug
            }
          : null
    };
  }

  async updateMemberAccessSettings(userId: number, data: UpdateAccessSettingsDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    let accessProfileId: number | null = null;
    if (data.access_profile_id !== undefined && data.access_profile_id !== null) {
      const profile = await this.accessProfilesRepository.findOne({
        where: { id: data.access_profile_id }
      });
      if (!profile) {
        throw new HttpException('Perfil de acesso não encontrado.', HttpStatus.BAD_REQUEST);
      }
      accessProfileId = profile.id;
    }

    user.accessProfileId =
      data.access_profile_id === undefined ? user.accessProfileId ?? null : accessProfileId;

    const saved = await this.usersRepository.save(user);
    const userWithProfile = await this.usersRepository.findOne({
      where: { id: saved.id },
      relations: { accessProfile: true }
    });

    return {
      user_id: saved.id,
      role: saved.role || Role.MEMBER,
      access_profile_id: userWithProfile?.accessProfileId ?? null,
      access_profile:
        userWithProfile?.accessProfile && userWithProfile.accessProfile.id
          ? {
              id: userWithProfile.accessProfile.id,
              name: userWithProfile.accessProfile.name,
              slug: userWithProfile.accessProfile.slug
            }
          : null
    };
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

    const timelineEvents: Array<{
      eventType: string;
      title: string;
      description?: string | null;
      eventDate: string;
    }> = [];

    if (toDateOnly(user.baptismDate) !== toDateOnly(saved.baptismDate) && saved.baptismDate) {
      timelineEvents.push({
        eventType: 'Batismo',
        title: 'Batismo registrado',
        eventDate: toDateOnly(saved.baptismDate) || new Date().toISOString().slice(0, 10)
      });
    }

    if (
      toDateOnly(user.professionFaithDate) !== toDateOnly(saved.professionFaithDate) &&
      saved.professionFaithDate
    ) {
      timelineEvents.push({
        eventType: 'ProfissaoFe',
        title: 'Profissão de fé registrada',
        eventDate: toDateOnly(saved.professionFaithDate) || new Date().toISOString().slice(0, 10)
      });
    }

    if (toDateOnly(user.churchEntryDate) !== toDateOnly(saved.churchEntryDate) && saved.churchEntryDate) {
      timelineEvents.push({
        eventType: 'EntradaIgreja',
        title: 'Entrada na igreja registrada',
        eventDate: toDateOnly(saved.churchEntryDate) || new Date().toISOString().slice(0, 10)
      });
    }

    if ((user.personType || '') !== (saved.personType || '')) {
      if ((saved.personType || '').trim().toLowerCase() === 'membro') {
        timelineEvents.push({
          eventType: 'Membresia',
          title: 'Tornou-se membro',
          eventDate: new Date().toISOString().slice(0, 10)
        });
      } else if ((saved.personType || '').trim().toLowerCase() === 'visitante') {
        timelineEvents.push({
          eventType: 'Membresia',
          title: 'Passou para visitante',
          eventDate: new Date().toISOString().slice(0, 10)
        });
      }
    }

    if ((user.memberStatus || '') !== (saved.memberStatus || '') && saved.memberStatus) {
      timelineEvents.push({
        eventType: 'StatusMembro',
        title: `Status alterado para ${saved.memberStatus}`,
        eventDate: new Date().toISOString().slice(0, 10)
      });
    }

    for (const event of timelineEvents) {
      await this.addAutomaticTimelineEvent({
        userId: saved.id,
        eventType: event.eventType,
        title: event.title,
        description: event.description || null,
        eventDate: event.eventDate
      });
    }

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

  async listMemberTimeline(userId: number) {
    await this.assertUserExists(userId);
    await this.usersRepository.query(ensureTimelineTableSql);

    const rows = (await this.usersRepository.query(
      `
        SELECT
          id,
          user_id,
          event_type,
          title,
          description,
          event_date,
          source,
          created_by_user_id,
          created_at
        FROM user_timeline_events
        WHERE user_id = ?
        ORDER BY event_date DESC, id DESC
      `,
      [userId]
    )) as TimelineEventRow[];

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      event_type: row.event_type,
      title: row.title,
      description: row.description,
      event_date: toDateOnly(row.event_date),
      source: row.source,
      created_by_user_id: row.created_by_user_id,
      created_at: toIsoString(row.created_at)
    }));
  }

  async createManualTimelineEvent(
    userId: number,
    adminUserId: number | null,
    data: CreateUserTimelineEventDto
  ) {
    await this.assertUserExists(userId);
    await this.usersRepository.query(ensureTimelineTableSql);

    const eventDate = toDateOnly(data.event_date);
    if (!eventDate) {
      throw new HttpException('Data do evento inválida.', HttpStatus.BAD_REQUEST);
    }

    await this.usersRepository.query(
      `
        INSERT INTO user_timeline_events (
          user_id, event_type, title, description, event_date, source, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, 'manual', ?)
      `,
      [
        userId,
        safeTrim(data.event_type) || 'Manual',
        data.title.trim(),
        safeTrim(data.description),
        eventDate,
        adminUserId
      ]
    );

    const [created] = await this.usersRepository.query(
      `
        SELECT
          id,
          user_id,
          event_type,
          title,
          description,
          event_date,
          source,
          created_by_user_id,
          created_at
        FROM user_timeline_events
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [userId]
    );

    return created
      ? {
          id: created.id,
          user_id: created.user_id,
          event_type: created.event_type,
          title: created.title,
          description: created.description,
          event_date: toDateOnly(created.event_date),
          source: created.source,
          created_by_user_id: created.created_by_user_id,
          created_at: toIsoString(created.created_at)
        }
      : null;
  }

  async addAutomaticTimelineEvent(input: {
    userId: number;
    eventType: string;
    title: string;
    description?: string | null;
    eventDate?: string | Date | null;
  }) {
    try {
      await this.assertUserExists(input.userId);
      await this.usersRepository.query(ensureTimelineTableSql);

      const eventDate = toDateOnly(input.eventDate) || new Date().toISOString().slice(0, 10);
      await this.usersRepository.query(
        `
          INSERT INTO user_timeline_events (
            user_id, event_type, title, description, event_date, source, created_by_user_id
          ) VALUES (?, ?, ?, ?, ?, 'automatico', NULL)
        `,
        [
          input.userId,
          safeTrim(input.eventType) || 'Automatico',
          input.title.trim(),
          safeTrim(input.description),
          eventDate
        ]
      );
    } catch {
      // Keep core flows working even if timeline write fails.
    }
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

  private async assertUserExists(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }
  }
}
