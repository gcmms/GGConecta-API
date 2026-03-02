import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { MinistriesService } from './ministries.service';
export declare class MinistriesController {
    private readonly ministriesService;
    constructor(ministriesService: MinistriesService);
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
    findOne(idParam: string): Promise<{
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
    create(body: CreateMinistryDto): Promise<{
        message: string;
        ministry: {
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
        };
    }>;
    update(idParam: string, body: UpdateMinistryDto): Promise<{
        message: string;
        ministry: {
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
        };
    }>;
    remove(idParam: string): Promise<{
        message: string;
    }>;
}
