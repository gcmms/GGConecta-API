import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ListBirthdaysQueryDto } from './dto/list-birthdays-query.dto';
type BirthdayRange = {
    from: string;
    to: string;
};
export declare class BirthdaysService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    private getDefaultCurrentMonthRange;
    private resolveRange;
    list(query: ListBirthdaysQueryDto): Promise<{
        range: BirthdayRange;
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
}
export {};
