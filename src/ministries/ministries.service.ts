import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Ministry } from '../entities/ministry.entity';
import { MinistryMember } from '../entities/ministry-member.entity';
import { User } from '../entities/user.entity';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';

const safeTrim = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeIdList = (ids?: number[]) =>
  Array.from(new Set((ids || []).filter((id) => Number.isInteger(id) && id > 0)));

const isActiveMember = (user: User) =>
  (user.personType || '').trim().toLowerCase() === 'membro' &&
  (user.memberStatus || '').trim().toLowerCase() === 'ativo';

@Injectable()
export class MinistriesService {
  constructor(
    @InjectRepository(Ministry)
    private readonly ministriesRepository: Repository<Ministry>,
    @InjectRepository(MinistryMember)
    private readonly ministryMembersRepository: Repository<MinistryMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async list() {
    const ministries = await this.ministriesRepository.find({
      relations: {
        leader: true,
        presbyter: true,
        memberships: {
          user: true
        }
      },
      order: {
        name: 'ASC'
      }
    });

    return ministries.map((ministry) => this.mapMinistry(ministry));
  }

  async findById(id: number) {
    const ministry = await this.loadMinistryOrFail(id);
    return this.mapMinistry(ministry);
  }

  async create(data: CreateMinistryDto) {
    const sanitizedName = safeTrim(data.name);
    if (!sanitizedName) {
      throw new HttpException('O nome do ministério é obrigatório.', HttpStatus.BAD_REQUEST);
    }

    await this.assertNameAvailable(sanitizedName);

    const leaderId = data.leader_user_id;
    const presbyterId = data.presbyter_user_id;
    const memberIds = normalizeIdList(data.member_user_ids);

    if (leaderId && memberIds.includes(leaderId)) {
      throw new HttpException(
        'O líder deve ser informado apenas no campo de líder, não na lista de membros.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (leaderId) {
      await this.validateActiveMembers([leaderId], 'Líder');
    }

    if (presbyterId) {
      await this.validateActiveMembers([presbyterId], 'Presbítero');
    }

    if (memberIds.length > 0) {
      await this.validateActiveMembers(memberIds, 'Membro');
    }

    const ministry = await this.ministriesRepository.save(
      this.ministriesRepository.create({
        name: sanitizedName,
        category: safeTrim(data.category),
        description: safeTrim(data.description),
        isActive: data.is_active ?? true,
        leaderUserId: leaderId || null,
        presbyterUserId: presbyterId || null
      })
    );

    await this.replaceMembers(ministry.id, memberIds);
    const reloaded = await this.loadMinistryOrFail(ministry.id);
    return this.mapMinistry(reloaded);
  }

  async update(id: number, data: UpdateMinistryDto) {
    const ministry = await this.loadMinistryOrFail(id);
    const sanitizedName = data.name !== undefined ? safeTrim(data.name) : undefined;

    if (data.name !== undefined && !sanitizedName) {
      throw new HttpException('O nome do ministério é obrigatório.', HttpStatus.BAD_REQUEST);
    }

    if (sanitizedName && sanitizedName !== ministry.name) {
      await this.assertNameAvailable(sanitizedName, id);
    }

    const nextLeaderId =
      data.leader_user_id === undefined ? ministry.leaderUserId || null : data.leader_user_id;
    const nextPresbyterId =
      data.presbyter_user_id === undefined
        ? ministry.presbyterUserId || null
        : data.presbyter_user_id;
    const shouldReplaceMembers = data.member_user_ids !== undefined;
    const nextMemberIds = shouldReplaceMembers
      ? normalizeIdList(data.member_user_ids)
      : ministry.memberships.map((membership) => membership.userId);

    if (nextLeaderId && nextMemberIds.includes(nextLeaderId)) {
      throw new HttpException(
        'O líder deve ser informado apenas no campo de líder, não na lista de membros.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (nextLeaderId) {
      await this.validateActiveMembers([nextLeaderId], 'Líder');
    }

    if (nextPresbyterId) {
      await this.validateActiveMembers([nextPresbyterId], 'Presbítero');
    }

    if (nextMemberIds.length > 0) {
      await this.validateActiveMembers(nextMemberIds, 'Membro');
    }

    ministry.name = sanitizedName ?? ministry.name;
    ministry.category = safeTrim(data.category) ?? ministry.category ?? null;
    ministry.description = safeTrim(data.description) ?? ministry.description ?? null;
    ministry.isActive = data.is_active ?? ministry.isActive;
    ministry.leaderUserId = nextLeaderId;
    ministry.presbyterUserId = nextPresbyterId;

    await this.ministriesRepository.save(ministry);

    if (shouldReplaceMembers) {
      await this.replaceMembers(id, nextMemberIds);
    }

    const reloaded = await this.loadMinistryOrFail(id);
    return this.mapMinistry(reloaded);
  }

  async remove(id: number) {
    const ministry = await this.loadMinistryOrFail(id);
    await this.ministriesRepository.remove(ministry);
    return { id };
  }

  private async loadMinistryOrFail(id: number) {
    const ministry = await this.ministriesRepository.findOne({
      where: { id },
      relations: {
        leader: true,
        presbyter: true,
        memberships: {
          user: true
        }
      }
    });

    if (!ministry) {
      throw new HttpException('Ministério não encontrado.', HttpStatus.NOT_FOUND);
    }

    return ministry;
  }

  private async replaceMembers(ministryId: number, memberIds: number[]) {
    await this.ministryMembersRepository.delete({ ministryId });
    if (memberIds.length === 0) return;

    const memberships = memberIds.map((userId) =>
      this.ministryMembersRepository.create({ ministryId, userId })
    );
    await this.ministryMembersRepository.save(memberships);
  }

  private async validateActiveMembers(
    userIds: number[],
    roleLabel: 'Líder' | 'Membro' | 'Presbítero'
  ) {
    const uniqueIds = normalizeIdList(userIds);
    if (uniqueIds.length === 0) return;

    const users = await this.usersRepository.find({
      where: { id: In(uniqueIds) }
    });

    if (users.length !== uniqueIds.length) {
      const foundIds = new Set(users.map((user) => user.id));
      const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
      throw new HttpException(
        `${roleLabel}(es) não encontrado(s): ${missingIds.join(', ')}.`,
        HttpStatus.BAD_REQUEST
      );
    }

    const invalidUsers = users.filter((user) => !isActiveMember(user)).map((user) => user.id);
    if (invalidUsers.length > 0) {
      throw new HttpException(
        `${roleLabel}(es) precisa(m) ser membro(s) ativo(s). IDs inválidos: ${invalidUsers.join(', ')}.`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async assertNameAvailable(name: string, ignoreMinistryId?: number) {
    const where = ignoreMinistryId
      ? { name, id: Not(ignoreMinistryId) }
      : { name };

    const existing = await this.ministriesRepository.findOne({ where });
    if (existing) {
      throw new HttpException('Já existe um ministério com este nome.', HttpStatus.BAD_REQUEST);
    }
  }

  private mapMinistry(ministry: Ministry) {
    const sortedMemberships = [...(ministry.memberships || [])].sort((a, b) => a.userId - b.userId);
    const members = sortedMemberships.map((membership) => ({
      user_id: membership.userId,
      full_name: `${membership.user?.firstName || ''} ${membership.user?.lastName || ''}`.trim()
    }));

    return {
      id: ministry.id,
      name: ministry.name,
      category: ministry.category || null,
      description: ministry.description || null,
      is_active: ministry.isActive,
      leader_user_id: ministry.leaderUserId || null,
      leader_name:
        ministry.leader && (ministry.leader.firstName || ministry.leader.lastName)
          ? `${ministry.leader.firstName} ${ministry.leader.lastName}`.trim()
          : null,
      presbyter_user_id: ministry.presbyterUserId || null,
      presbyter_name:
        ministry.presbyter && (ministry.presbyter.firstName || ministry.presbyter.lastName)
          ? `${ministry.presbyter.firstName} ${ministry.presbyter.lastName}`.trim()
          : null,
      member_user_ids: members.map((member) => member.user_id),
      members_count: members.length,
      members,
      created_at: ministry.createdAt?.toISOString?.() || null,
      updated_at: ministry.updatedAt?.toISOString?.() || null
    };
  }
}
