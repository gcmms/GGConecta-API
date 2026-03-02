import { BirthdaysService } from './birthdays.service';
import { BirthdayTemplatesService } from './birthday-templates.service';
import { CreateBirthdayTemplateDto } from './dto/create-birthday-template.dto';
import { ListBirthdaysQueryDto } from './dto/list-birthdays-query.dto';
export declare class BirthdaysController {
    private readonly birthdaysService;
    private readonly birthdayTemplatesService;
    constructor(birthdaysService: BirthdaysService, birthdayTemplatesService: BirthdayTemplatesService);
    list(query: ListBirthdaysQueryDto): Promise<{
        range: {
            from: string;
            to: string;
        };
        total: number;
        items: {
            id: number;
            first_name: string;
            last_name: string;
            full_name: string;
            birth_date: string;
            birth_month_day: string;
            age: number | null;
            phone: string | null;
            person_type: string;
            member_status: string | null;
            role: string;
        }[];
    }>;
    listTemplates(): Promise<{
        id: number;
        name: string;
        channel: string;
        title: string | null;
        body: string;
        allowed_variables: string[];
        is_active: boolean;
        created_at: string | null;
        updated_at: string | null;
    }[]>;
    createTemplate(body: CreateBirthdayTemplateDto): Promise<{
        message: string;
        template: {
            id: number;
            name: string;
            channel: string;
            title: string | null;
            body: string;
            allowed_variables: string[];
            is_active: boolean;
            created_at: string | null;
            updated_at: string | null;
        };
    }>;
}
