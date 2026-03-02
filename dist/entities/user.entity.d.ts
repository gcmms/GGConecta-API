import { CommunityPost } from './community-post.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CommunityPostComment } from './community-post-comment.entity';
import { Ministry } from './ministry.entity';
import { MinistryMember } from './ministry-member.entity';
export declare enum UserRole {
    ADMIN = "Administrador",
    MEMBER = "Membro",
    NON_MEMBER = "N\u00E3o membro"
}
export declare class User {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    email: string;
    phone?: string | null;
    secondaryPhone?: string | null;
    socialName?: string | null;
    gender?: string | null;
    maritalStatus?: string | null;
    cpf?: string | null;
    rgNumber?: string | null;
    rgIssuer?: string | null;
    rgState?: string | null;
    baptismDate?: string | null;
    professionFaithDate?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    personType: string;
    memberStatus?: string | null;
    churchEntryDate?: string | null;
    churchOrigin?: string | null;
    internalNotes?: string | null;
    role: string;
    passwordHash: string;
    addressStreet?: string | null;
    addressNumber?: string | null;
    addressDistrict?: string | null;
    addressCity?: string | null;
    addressState?: string | null;
    addressZip?: string | null;
    addressComplement?: string | null;
    createdAt: Date;
    updatedAt: Date;
    posts: CommunityPost[];
    likes: CommunityPostLike[];
    comments: CommunityPostComment[];
    ledMinistries: Ministry[];
    presbyterResponsibleMinistries: Ministry[];
    ministryMemberships: MinistryMember[];
}
