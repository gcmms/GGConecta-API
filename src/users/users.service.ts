import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../common/constants/roles.enum';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Ministry } from '../entities/ministry.entity';
import { MinistryMember } from '../entities/ministry-member.entity';

type UserMinistryLink = {
  ministry_id: number;
  ministry_name: string;
  role: 'Líder' | 'Membro';
  is_active: boolean;
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
