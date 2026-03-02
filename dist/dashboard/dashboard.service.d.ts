import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class DashboardService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    overview(): Promise<{
        membros_ativos: number;
        visitantes: number;
        aniversariantes_semana: number;
    }>;
}
