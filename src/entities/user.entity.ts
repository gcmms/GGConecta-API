import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CommunityPostComment } from './community-post-comment.entity';
import { Ministry } from './ministry.entity';
import { MinistryMember } from './ministry-member.entity';

export enum UserRole {
  ADMIN = 'Administrador',
  MEMBER = 'Membro',
  NON_MEMBER = 'Não membro'
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  phone?: string | null;

  @Column({ name: 'secondary_phone', nullable: true, type: 'varchar', length: 255 })
  secondaryPhone?: string | null;

  @Column({ name: 'social_name', nullable: true, type: 'varchar', length: 255 })
  socialName?: string | null;

  @Column({ name: 'gender', nullable: true, type: 'varchar', length: 30 })
  gender?: string | null;

  @Column({ name: 'marital_status', nullable: true, type: 'varchar', length: 50 })
  maritalStatus?: string | null;

  @Column({ name: 'cpf', nullable: true, type: 'varchar', length: 20 })
  cpf?: string | null;

  @Column({ name: 'rg_number', nullable: true, type: 'varchar', length: 30 })
  rgNumber?: string | null;

  @Column({ name: 'rg_issuer', nullable: true, type: 'varchar', length: 100 })
  rgIssuer?: string | null;

  @Column({ name: 'rg_state', nullable: true, type: 'varchar', length: 10 })
  rgState?: string | null;

  @Column({ name: 'baptism_date', nullable: true, type: 'date' })
  baptismDate?: string | null;

  @Column({ name: 'profession_faith_date', nullable: true, type: 'date' })
  professionFaithDate?: string | null;

  @Column({ name: 'emergency_contact_name', nullable: true, type: 'varchar', length: 255 })
  emergencyContactName?: string | null;

  @Column({ name: 'emergency_contact_phone', nullable: true, type: 'varchar', length: 255 })
  emergencyContactPhone?: string | null;

  @Column({ name: 'person_type', type: 'varchar', length: 20, default: 'Membro' })
  personType: string;

  @Column({ name: 'member_status', nullable: true, type: 'varchar', length: 40 })
  memberStatus?: string | null;

  @Column({ name: 'church_entry_date', nullable: true, type: 'date' })
  churchEntryDate?: string | null;

  @Column({ name: 'church_origin', nullable: true, type: 'varchar', length: 255 })
  churchOrigin?: string | null;

  @Column({ name: 'internal_notes', nullable: true, type: 'text' })
  internalNotes?: string | null;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 50,
    default: UserRole.MEMBER
  })
  role: string;

  @Column({ name: 'session_version', type: 'int', default: 1 })
  sessionVersion: number;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'address_street', nullable: true, type: 'varchar', length: 255 })
  addressStreet?: string | null;

  @Column({ name: 'address_number', nullable: true, type: 'varchar', length: 50 })
  addressNumber?: string | null;

  @Column({ name: 'address_district', nullable: true, type: 'varchar', length: 255 })
  addressDistrict?: string | null;

  @Column({ name: 'address_city', nullable: true, type: 'varchar', length: 255 })
  addressCity?: string | null;

  @Column({ name: 'address_state', nullable: true, type: 'varchar', length: 100 })
  addressState?: string | null;

  @Column({ name: 'address_zip', nullable: true, type: 'varchar', length: 50 })
  addressZip?: string | null;

  @Column({ name: 'address_complement', nullable: true, type: 'varchar', length: 255 })
  addressComplement?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CommunityPost, (post) => post.user)
  posts: CommunityPost[];

  @OneToMany(() => CommunityPostLike, (like) => like.user)
  likes: CommunityPostLike[];

  @OneToMany(() => CommunityPostComment, (comment) => comment.user)
  comments: CommunityPostComment[];

  @OneToMany(() => Ministry, (ministry) => ministry.leader)
  ledMinistries: Ministry[];

  @OneToMany(() => Ministry, (ministry) => ministry.presbyter)
  presbyterResponsibleMinistries: Ministry[];

  @OneToMany(() => MinistryMember, (membership) => membership.user)
  ministryMemberships: MinistryMember[];
}
