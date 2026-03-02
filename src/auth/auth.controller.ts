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
  async login(@Body() body: LoginDto) {
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

    try {
      const { token, user } = await this.authService.login(body);
      return {
        message: 'Login realizado com sucesso!',
        token,
        user
      };
    } catch (error: any) {
      const { status, message } = extractErrorStatusAndMessage(
        error,
        'Erro ao realizar login.'
      );
      throw new HttpException({ message }, status);
    }
  }

  @Post('login/admin')
  async loginAdmin(@Body() body: LoginDto) {
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

    try {
      const { token, user } = await this.authService.loginAdmin(body);
      return {
        message: 'Login administrativo realizado com sucesso!',
        token,
        user
      };
    } catch (error: any) {
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
