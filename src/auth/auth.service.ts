import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../common/constants/roles.enum';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const mapUserToResponse = (user: User) => ({
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
  person_type: user.personType || (normalizeRole(user.role) === Role.NON_MEMBER ? 'Visitante' : 'Membro'),
  member_status: user.memberStatus ?? null,
  church_entry_date: user.churchEntryDate ?? null,
  church_origin: user.churchOrigin ?? null,
  internal_notes: user.internalNotes ?? null,
  birth_date: user.birthDate,
  created_at: user.createdAt?.toISOString?.() || null,
  updated_at: user.updatedAt?.toISOString?.() || null,
  role: user.role || Role.MEMBER,
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

const normalizeRole = (incomingRole?: string) => {
  if (!incomingRole) return Role.MEMBER;

  const normalized = incomingRole.trim().toLowerCase();

  if (normalized === 'administrador') return Role.ADMIN;
  if (normalized === 'membro') return Role.MEMBER;
  if (normalized === 'não membro' || normalized === 'nao membro') return Role.NON_MEMBER;

  return Role.MEMBER;
};

const isAdminRole = (incomingRole?: string) => normalizeRole(incomingRole) === Role.ADMIN;
const isInactiveMemberStatus = (memberStatus?: string | null) =>
  (memberStatus || '').trim().toLowerCase() === 'inativo';
const normalizePersonType = (incoming?: string, role?: string) => {
  if (incoming?.trim().toLowerCase() === 'membro') return 'Membro';
  if (incoming?.trim().toLowerCase() === 'visitante') return 'Visitante';
  return normalizeRole(role) === Role.NON_MEMBER ? 'Visitante' : 'Membro';
};
const safeTrim = (value?: string | null) => value?.trim() || null;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register(data: RegisterDto) {
    const missingFields = ['first_name', 'last_name', 'birth_date', 'email', 'password'].filter(
      (field) => {
        const value = (data as Record<string, any>)[field];
        return value === undefined || value === null || String(value).trim() === '';
      }
    );

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

    const passwordHash = await bcrypt.hash(data.password, 10);
    const role = Role.MEMBER;

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
      personType: normalizePersonType(data.person_type, role),
      memberStatus: safeTrim(data.member_status),
      churchEntryDate: safeTrim(data.church_entry_date),
      churchOrigin: safeTrim(data.church_origin),
      internalNotes: safeTrim(data.internal_notes),
      role,
      sessionVersion: 1,
      passwordHash,
      addressStreet: safeTrim(data.address?.street),
      addressNumber: safeTrim(data.address?.number),
      addressDistrict: safeTrim(data.address?.district),
      addressCity: safeTrim(data.address?.city),
      addressState: safeTrim(data.address?.state),
      addressZip: safeTrim(data.address?.zip),
      addressComplement: safeTrim(data.address?.complement)
    });

    const saved = await this.usersRepository.save(user);
    return mapUserToResponse(saved);
  }

  async login({ email, password }: LoginDto) {
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
        'sessionVersion',
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
      throw new HttpException('Credenciais inválidas.', HttpStatus.UNAUTHORIZED);
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      throw new HttpException('Credenciais inválidas.', HttpStatus.UNAUTHORIZED);
    }

    if (isInactiveMemberStatus(user.memberStatus)) {
      throw new HttpException('Usuário inativo.', HttpStatus.FORBIDDEN);
    }

    const nextSessionVersion = (user.sessionVersion || 0) + 1;
    await this.usersRepository.update({ id: user.id }, { sessionVersion: nextSessionVersion });

    const payload = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      role: user.role || Role.MEMBER,
      session_version: nextSessionVersion
    };

    const token = await this.jwtService.signAsync(payload);

    return { token, user: mapUserToResponse(user) };
  }

  async loginAdmin(data: LoginDto) {
    const result = await this.login(data);
    if (!isAdminRole(result.user.role)) {
      throw new HttpException(
        'Acesso restrito: somente administradores podem acessar o painel web.',
        HttpStatus.FORBIDDEN
      );
    }

    return result;
  }

  async currentUser(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    return mapUserToResponse(user);
  }

  async updateProfile(userId: number, data: UpdateProfileDto) {
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

    return mapUserToResponse(saved);
  }
}
