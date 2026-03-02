import { CreateMuralDto } from './dto/create-mural.dto';
import { MuralService } from './mural.service';
export declare class MuralController {
    private readonly muralService;
    constructor(muralService: MuralService);
    list(): Promise<{
        id: number;
        title: string;
        subtitle: string;
        publish_date: string;
        link: string | null;
        created_at: string;
        updated_at: string;
    }[]>;
    create(body: CreateMuralDto): Promise<{
        message: string;
        item: {
            id: number;
            title: string;
            subtitle: string;
            publish_date: string;
            link: string | null;
            created_at: string;
            updated_at: string;
        };
    }>;
    remove(idParam: string): Promise<{
        message: string;
    }>;
}
