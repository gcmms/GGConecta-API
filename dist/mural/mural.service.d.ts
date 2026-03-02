import { Repository } from 'typeorm';
import { MuralItem } from '../entities/mural-item.entity';
import { CreateMuralDto } from './dto/create-mural.dto';
export declare class MuralService {
    private readonly muralRepository;
    constructor(muralRepository: Repository<MuralItem>);
    list(): Promise<{
        id: number;
        title: string;
        subtitle: string;
        publish_date: string;
        link: string | null;
        created_at: string;
        updated_at: string;
    }[]>;
    create(data: CreateMuralDto): Promise<{
        id: number;
        title: string;
        subtitle: string;
        publish_date: string;
        link: string | null;
        created_at: string;
        updated_at: string;
    }>;
    remove(id: number): Promise<boolean | 0 | null | undefined>;
}
