import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

function extractErrorStatusAndMessage(
  error: any,
  fallbackInternalMessage: string
) {
  const status =
    error instanceof HttpException
      ? error.getStatus()
      : error?.status || HttpStatus.INTERNAL_SERVER_ERROR;

  const response =
    error instanceof HttpException ? error.getResponse() : error?.response;
  const responseMessage =
    typeof response === 'string'
      ? response
      : typeof response?.message === 'string'
        ? response.message
        : undefined;
  const message =
    status === HttpStatus.INTERNAL_SERVER_ERROR
      ? fallbackInternalMessage
      : responseMessage || error?.message || 'Erro.';

  return { status, message };
}

type LoginAttemptState = {
  count: number;
  windowStartedAt: number;
  blockedUntil: number;
};

const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const ATTEMPT_BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, LoginAttemptState>();

const normalizeEmail = (email?: string) => (email || '').trim().toLowerCase();

const getClientIp = (req: any) => {
  const xForwardedFor = req?.headers?.['x-forwarded-for'];
  const forwardedIp = Array.isArray(xForwardedFor)
    ? xForwardedFor[0]
    : typeof xForwardedFor === 'string'
      ? xForwardedFor.split(',')[0]
      : '';
  return (forwardedIp || req?.ip || req?.socket?.remoteAddress || 'unknown').trim();
};

const buildLoginAttemptKey = (email: string, ip: string, scope: 'user' | 'admin') =>
  `${scope}:${normalizeEmail(email)}:${ip}`;

const assertNotRateLimited = (key: string) => {
  const state = loginAttempts.get(key);
  const now = Date.now();
  if (!state) return;

  if (state.blockedUntil > now) {
    throw new HttpException(
      { message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  if (now - state.windowStartedAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(key);
  }
};

const registerFailedAttempt = (key: string) => {
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || now - current.windowStartedAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(key, {
      count: 1,
      windowStartedAt: now,
      blockedUntil: 0
    });
    return;
  }

  const nextCount = current.count + 1;
  loginAttempts.set(key, {
    count: nextCount,
    windowStartedAt: current.windowStartedAt,
    blockedUntil: nextCount >= MAX_ATTEMPTS ? now + ATTEMPT_BLOCK_MS : 0
  });
};

const clearFailedAttempts = (key: string) => {
  loginAttempts.delete(key);
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      const user = await this.authService.register(body);
      return {
        message: 'Usuário criado com sucesso!',
        user
      };
    } catch (error: any) {
      const { status, message } = extractErrorStatusAndMessage(
        error,
        'Erro ao criar usuário.'
      );
      throw new HttpException({ message }, status);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: any) {
    const missing = ['email', 'password'].filter((field) => {
      const value = (body as Record<string, any>)[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      throw new HttpException(
        { message: 'Email e senha são obrigatórios.' },
        HttpStatus.BAD_REQUEST
      );
    }

    const loginAttemptKey = buildLoginAttemptKey(body.email, getClientIp(req), 'user');
    assertNotRateLimited(loginAttemptKey);

    try {
      const { token, user } = await this.authService.login(body);
      clearFailedAttempts(loginAttemptKey);
      return {
        message: 'Login realizado com sucesso!',
        token,
        user
      };
    } catch (error: any) {
      if (
        error?.status === HttpStatus.UNAUTHORIZED ||
        error?.status === HttpStatus.FORBIDDEN
      ) {
        registerFailedAttempt(loginAttemptKey);
      }
      const { status, message } = extractErrorStatusAndMessage(
        error,
        'Erro ao realizar login.'
      );
      throw new HttpException({ message }, status);
    }
  }

  @Post('login/admin')
  async loginAdmin(@Body() body: LoginDto, @Req() req: any) {
    const missing = ['email', 'password'].filter((field) => {
      const value = (body as Record<string, any>)[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      throw new HttpException(
        { message: 'Email e senha são obrigatórios.' },
        HttpStatus.BAD_REQUEST
      );
    }

    const loginAttemptKey = buildLoginAttemptKey(body.email, getClientIp(req), 'admin');
    assertNotRateLimited(loginAttemptKey);

    try {
      const { token, user } = await this.authService.loginAdmin(body);
      clearFailedAttempts(loginAttemptKey);
      return {
        message: 'Login administrativo realizado com sucesso!',
        token,
        user
      };
    } catch (error: any) {
      if (
        error?.status === HttpStatus.UNAUTHORIZED ||
        error?.status === HttpStatus.FORBIDDEN
      ) {
        registerFailedAttempt(loginAttemptKey);
      }
      const { status, message } = extractErrorStatusAndMessage(
        error,
        'Erro ao realizar login.'
      );
      throw new HttpException({ message }, status);
    }
  }

  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException(
        { message: 'Usuário não identificado.' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const user = await this.authService.currentUser(userId);
      return { user };
    } catch (error: any) {
      const { status, message } = extractErrorStatusAndMessage(
        error,
        'Erro ao carregar usuário.'
      );
      throw new HttpException({ message }, status);
    }
  }

  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException(
        { message: 'Usuário não identificado.' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const user = await this.authService.updateProfile(userId, body);
      return { user, message: 'Perfil atualizado com sucesso.' };
    } catch (error: any) {
      const { status, message } = extractErrorStatusAndMessage(
        error,
        'Erro ao atualizar perfil.'
      );
      throw new HttpException({ message }, status);
    }
  }
}
