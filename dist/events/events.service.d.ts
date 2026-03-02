import { ConfigService } from '@nestjs/config';
export declare class EventsService {
    private readonly configService;
    constructor(configService: ConfigService);
    fetchEvents(): Promise<{
        id: any;
        title: string;
        description: string;
        location: string;
        start_date: any;
        end_date: any;
        all_day: boolean;
    }[]>;
}
