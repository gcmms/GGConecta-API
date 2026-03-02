import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    list(): Promise<{
        id: any;
        title: string;
        description: string;
        location: string;
        start_date: any;
        end_date: any;
        all_day: boolean;
    }[]>;
}
