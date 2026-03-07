import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/constants/roles.enum';
import { AccessProfile } from '../entities/access-profile.entity';
import { User } from '../entities/user.entity';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';

const normalizeBaseRole = (role?: string | null) => {
  const normalized = (role || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'administrador') return Role.ADMIN;
  if (normalized === 'membro') return Role.MEMBER;
  if (normalized === 'não membro' || normalized === 'nao membro') return Role.NON_MEMBER;
  throw new BadRequestException('Base de papel inválida. Use: Administrador, Membro ou Não membro.');
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

@Injectable()
export class AccessProfilesService {
  constructor(
    @InjectRepository(AccessProfile)
    private readonly accessProfilesRepository: Repository<AccessProfile>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  private mapPermissions(profile: AccessProfile) {
    return {
      dashboard: !!profile.canDashboard,
      pessoas: !!profile.canPeople,
      ministerios: !!profile.canMinistries,
      comunicados: !!profile.canPosts,
      oracoes: !!profile.canPrayers,
      eventos: !!profile.canEvents,
      escalas: !!profile.canSchedules,
      aniversariantes: !!profile.canBirthdays,
      inventario: !!profile.canInventory,
      configuracoes: !!profile.canSettings,
      perfis_acesso: !!profile.canAccessProfiles
    };
  }

  private mapProfile(profile: AccessProfile) {
    return {
      id: profile.id,
      name: profile.name,
      slug: profile.slug,
      base_role: profile.baseRole,
      is_system: !!profile.isSystem,
      is_active: !!profile.isActive,
      permissions: this.mapPermissions(profile),
      created_at: profile.createdAt?.toISOString?.() || null,
      updated_at: profile.updatedAt?.toISOString?.() || null
    };
  }

  private async findByIdOrFail(id: number) {
    const profile = await this.accessProfilesRepository.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Perfil de acesso não encontrado.');
    return profile;
  }

  private mapDtoToEntity(
    entity: AccessProfile,
    dto: CreateAccessProfileDto | UpdateAccessProfileDto
  ) {
    if (dto.name !== undefined) entity.name = dto.name.trim();
    if (dto.base_role !== undefined) entity.baseRole = normalizeBaseRole(dto.base_role);
    if (dto.is_active !== undefined) entity.isActive = !!dto.is_active;
    if (dto.can_dashboard !== undefined) entity.canDashboard = !!dto.can_dashboard;
    if (dto.can_people !== undefined) entity.canPeople = !!dto.can_people;
    if (dto.can_ministries !== undefined) entity.canMinistries = !!dto.can_ministries;
    if (dto.can_posts !== undefined) entity.canPosts = !!dto.can_posts;
    if (dto.can_prayers !== undefined) entity.canPrayers = !!dto.can_prayers;
    if (dto.can_events !== undefined) entity.canEvents = !!dto.can_events;
    if (dto.can_schedules !== undefined) entity.canSchedules = !!dto.can_schedules;
    if (dto.can_birthdays !== undefined) entity.canBirthdays = !!dto.can_birthdays;
    if (dto.can_inventory !== undefined) entity.canInventory = !!dto.can_inventory;
    if (dto.can_settings !== undefined) entity.canSettings = !!dto.can_settings;
    if (dto.can_access_profiles !== undefined) {
      entity.canAccessProfiles = !!dto.can_access_profiles;
    }
  }

  async list() {
    const profiles = await this.accessProfilesRepository.find({
      order: { isSystem: 'DESC', name: 'ASC' }
    });
    return profiles.map((profile) => this.mapProfile(profile));
  }

  async create(dto: CreateAccessProfileDto) {
    const trimmedName = dto.name?.trim();
    if (!trimmedName) throw new BadRequestException('Nome do perfil é obrigatório.');

    const slug = slugify(trimmedName);
    if (!slug) throw new BadRequestException('Nome do perfil inválido.');

    const existingByName = await this.accessProfilesRepository.findOne({
      where: { name: trimmedName }
    });
    if (existingByName) throw new BadRequestException('Já existe um perfil com este nome.');

    const existingBySlug = await this.accessProfilesRepository.findOne({ where: { slug } });
    if (existingBySlug) throw new BadRequestException('Já existe um perfil semelhante.');

    const profile = this.accessProfilesRepository.create({
      name: trimmedName,
      slug,
      isSystem: false,
      isActive: dto.is_active !== undefined ? !!dto.is_active : true,
      baseRole: normalizeBaseRole(dto.base_role)
    });

    this.mapDtoToEntity(profile, dto);
    const saved = await this.accessProfilesRepository.save(profile);
    return this.mapProfile(saved);
  }

  async update(id: number, dto: UpdateAccessProfileDto) {
    const profile = await this.findByIdOrFail(id);

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (!trimmedName) throw new BadRequestException('Nome do perfil é obrigatório.');

      if (trimmedName !== profile.name) {
        const existingByName = await this.accessProfilesRepository.findOne({
          where: { name: trimmedName }
        });
        if (existingByName && existingByName.id !== profile.id) {
          throw new BadRequestException('Já existe um perfil com este nome.');
        }
        profile.name = trimmedName;
        profile.slug = slugify(trimmedName);
      }
    }

    this.mapDtoToEntity(profile, dto);
    const saved = await this.accessProfilesRepository.save(profile);
    return this.mapProfile(saved);
  }

  async remove(id: number) {
    const profile = await this.findByIdOrFail(id);
    if (profile.isSystem) {
      throw new BadRequestException('Perfis de sistema não podem ser removidos.');
    }
    await this.accessProfilesRepository.delete({ id });
    return { success: true };
  }

  async getEffectiveProfileForRole(role?: string) {
    const normalizedRole = normalizeBaseRole(role);
    if (!normalizedRole) return null;

    const profile =
      (await this.accessProfilesRepository.findOne({
        where: { baseRole: normalizedRole, isActive: true },
        order: { isSystem: 'DESC', id: 'ASC' }
      })) ||
      (await this.accessProfilesRepository.findOne({
        where: { baseRole: normalizedRole },
        order: { isSystem: 'DESC', id: 'ASC' }
      }));

    if (!profile) return null;
    return this.mapProfile(profile);
  }

  async getEffectiveProfileForUser(userId?: number, role?: string) {
    if (Number.isInteger(userId) && (userId as number) > 0) {
      const user = await this.usersRepository.findOne({
        where: { id: userId as number },
        relations: { accessProfile: true }
      });

      if (user?.accessProfile && user.accessProfile.isActive) {
        return this.mapProfile(user.accessProfile);
      }
    }

    return this.getEffectiveProfileForRole(role);
  }
}
