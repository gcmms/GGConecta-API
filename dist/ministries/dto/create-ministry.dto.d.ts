export declare class CreateMinistryDto {
    name: string;
    category?: string;
    description?: string;
    is_active?: boolean;
    leader_user_id?: number | null;
    presbyter_user_id?: number | null;
    member_user_ids?: number[];
}
