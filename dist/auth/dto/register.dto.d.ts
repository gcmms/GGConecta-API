declare class AddressDto {
    street?: string;
    number?: string;
    district?: string;
    city?: string;
    state?: string;
    zip?: string;
    complement?: string;
}
export declare class RegisterDto {
    first_name: string;
    last_name: string;
    birth_date: string;
    email: string;
    phone?: string;
    secondary_phone?: string;
    social_name?: string;
    gender?: string;
    marital_status?: string;
    cpf?: string;
    rg_number?: string;
    rg_issuer?: string;
    rg_state?: string;
    baptism_date?: string;
    profession_faith_date?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    person_type?: string;
    member_status?: string;
    church_entry_date?: string;
    church_origin?: string;
    internal_notes?: string;
    password: string;
    role?: string;
    address?: AddressDto;
}
export {};
