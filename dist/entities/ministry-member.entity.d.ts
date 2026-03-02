import { Ministry } from './ministry.entity';
import { User } from './user.entity';
export declare class MinistryMember {
    id: number;
    ministryId: number;
    userId: number;
    ministry: Ministry;
    user: User;
    createdAt: Date;
}
