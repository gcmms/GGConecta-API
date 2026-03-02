import { User } from './user.entity';
import { MinistryMember } from './ministry-member.entity';
export declare class Ministry {
    id: number;
    name: string;
    category?: string | null;
    description?: string | null;
    isActive: boolean;
    leaderUserId?: number | null;
    presbyterUserId?: number | null;
    leader?: User | null;
    presbyter?: User | null;
    memberships: MinistryMember[];
    createdAt: Date;
    updatedAt: Date;
}
