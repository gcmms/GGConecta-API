import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

export type JwtPayload = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  session_version: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersRepository.findOne({ where: { id: payload.id } });
    if (!user) {
      throw new UnauthorizedException('Token inválido.');
    }

    if ((user.memberStatus || '').trim().toLowerCase() === 'inativo') {
      throw new UnauthorizedException('Usuário inativo.');
    }

    if (!payload.session_version || payload.session_version !== user.sessionVersion) {
      throw new UnauthorizedException('Sessão inválida.');
    }

    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      role: user.role,
      member_status: user.memberStatus,
      session_version: user.sessionVersion
    };
  }
}
