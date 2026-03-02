import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BirthdayMessageTemplate } from '../entities/birthday-message-template.entity';
import { CreateBirthdayTemplateDto } from './dto/create-birthday-template.dto';
export declare class BirthdayTemplatesService implements OnModuleInit {
    private readonly templatesRepository;
    constructor(templatesRepository: Repository<BirthdayMessageTemplate>);
    onModuleInit(): Promise<void>;
    list(): Promise<{
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
    create(data: CreateBirthdayTemplateDto): Promise<{
        id: number;
        name: string;
        channel: string;
        title: string | null;
        body: string;
        allowed_variables: string[];
        is_active: boolean;
        created_at: string | null;
        updated_at: string | null;
    }>;
    private ensureDefaultTemplates;
}
