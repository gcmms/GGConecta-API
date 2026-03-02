import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    overview(): Promise<{
        membros_ativos: number;
        visitantes: number;
        aniversariantes_semana: number;
    }>;
}
