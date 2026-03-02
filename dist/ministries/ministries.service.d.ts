import { Repository } from 'typeorm';
import { Ministry } from '../entities/ministry.entity';
import { MinistryMember } from '../entities/ministry-member.entity';
import { User } from '../entities/user.entity';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
export declare class MinistriesService {
    private readonly ministriesRepository;
    private readonly ministryMembersRepository;
    private readonly usersRepository;
    constructor(ministriesRepository: Repository<Ministry>, ministryMembersRepository: Repository<MinistryMember>, usersRepository: Repository<User>);
    list(): Promise<{
        id: number;
        name: string;
        category: string | null;
        description: string | null;
        is_active: boolean;
        leader_user_id: number | null;
        leader_name: string | null;
        presbyter_user_id: number | null;
        presbyter_name: string | null;
        member_user_ids: number[];
        members_count: number;
        members: {
            user_id: number;
            full_name: string;
        }[];
        created_at: string | null;
        updated_at: string | null;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        name: string;
        category: string | null;
        description: string | null;
        is_active: boolean;
        leader_user_id: number | null;
        leader_name: string | null;
        presbyter_user_id: number | null;
        presbyter_name: string | null;
        member_user_ids: number[];
        members_count: number;
        members: {
            user_id: number;
            full_name: string;
        }[];
        created_at: string | null;
        updated_at: string | null;
    }>;
    create(data: CreateMinistryDto): Promise<{
        id: number;
        name: string;
        category: string | null;
        description: string | null;
        is_active: boolean;
        leader_user_id: number | null;
        leader_name: string | null;
        presbyter_user_id: number | null;
        presbyter_name: string | null;
        member_user_ids: number[];
        members_count: number;
        members: {
            user_id: number;
            full_name: string;
        }[];
        created_at: string | null;
        updated_at: string | null;
    }>;
    update(id: number, data: UpdateMinistryDto): Promise<{
        id: number;
        name: string;
        category: string | null;
        description: string | null;
        is_active: boolean;
        leader_user_id: number | null;
        leader_name: string | null;
        presbyter_user_id: number | null;
        presbyter_name: string | null;
        member_user_ids: number[];
        members_count: number;
        members: {
            user_id: number;
            full_name: string;
        }[];
        created_at: string | null;
        updated_at: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
    }>;
    private loadMinistryOrFail;
    private replaceMembers;
    private validateActiveMembers;
    private assertNameAvailable;
    private mapMinistry;
}
