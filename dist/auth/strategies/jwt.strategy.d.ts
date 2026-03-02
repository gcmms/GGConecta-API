import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
export type JwtPayload = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
};
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usersRepository;
    constructor(configService: ConfigService, usersRepository: Repository<User>);
    validate(payload: JwtPayload): Promise<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
    }>;
}
export {};
