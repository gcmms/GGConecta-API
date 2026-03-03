import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../constants/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(Role | string)[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole: string | undefined = request.user?.role;
    const memberStatus: string | undefined = request.user?.member_status;

    if (!userRole) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    if ((memberStatus || '').trim().toLowerCase() === 'inativo') {
      throw new ForbiddenException('Usuário inativo sem permissão de acesso.');
    }

    const normalizedRole = userRole.trim();
    const allowed = requiredRoles.some((role) => role === normalizedRole);

    if (!allowed) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
