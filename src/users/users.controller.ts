import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Body,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/constants/roles.enum';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateAccessSettingsDto } from './dto/update-access-settings.dto';
import { CreateUserTimelineEventDto } from './dto/create-user-timeline-event.dto';
import { UsersService } from './users.service';

@ApiTags('Auth')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list() {
    try {
      const members = await this.usersService.listMembers();
      return members;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to list members', error);
      throw new HttpException(
        { message: 'Erro ao listar membros da igreja.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.usersService.findMemberById(id);
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao carregar membro.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Post()
  async createMember(@Body() body: CreateUserDto) {
    try {
      const result = await this.usersService.createMember(body);
      return {
        message: 'Pessoa cadastrada com sucesso.',
        user: result.user,
        temporary_password: result.temporaryPassword
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao cadastrar pessoa.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Patch(':id/role')
  async updateRole(
    @Param('id') idParam: string,
    @Body() body: UpdateRoleDto
  ) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.usersService.updateMemberRole(id, body);
      return {
        message: 'Papel atualizado com sucesso.',
        user
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao atualizar papel.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Get(':id/access-settings')
  async getAccessSettings(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.usersService.getMemberAccessSettings(id);
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao carregar configurações de acesso.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Patch(':id/access-settings')
  async updateAccessSettings(
    @Param('id') idParam: string,
    @Body() body: UpdateAccessSettingsDto
  ) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const settings = await this.usersService.updateMemberAccessSettings(id, body);
      return {
        message: 'Configurações de acesso atualizadas com sucesso.',
        settings
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao atualizar configurações de acesso.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Patch(':id')
  async updateMember(
    @Param('id') idParam: string,
    @Body() body: UpdateProfileDto
  ) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.usersService.updateMember(id, body);
      return {
        message: 'Membro atualizado com sucesso.',
        user
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao atualizar membro.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') idParam: string,
    @Body() body: UpdatePasswordDto,
    @Req() request: any
  ) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const adminUserId =
        Number.isInteger(Number(request?.user?.id)) && Number(request?.user?.id) > 0
          ? Number(request.user.id)
          : null;

      const result = await this.usersService.updateMemberPasswordWithHistory(
        id,
        adminUserId,
        body
      );
      return {
        message: 'Senha atualizada com sucesso.',
        mode: result.mode,
        temporary_password: result.temporaryPassword,
        email_sent: result.emailSent
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao atualizar senha.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Get(':id/password-history')
  async passwordHistory(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.usersService.listMemberPasswordHistory(id);
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao carregar histórico de senha.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Get(':id/timeline')
  async timeline(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.usersService.listMemberTimeline(id);
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao carregar timeline do membro.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Post(':id/timeline')
  async createTimelineEvent(
    @Param('id') idParam: string,
    @Body() body: CreateUserTimelineEventDto,
    @Req() request: any
  ) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const adminUserId =
        Number.isInteger(Number(request?.user?.id)) && Number(request?.user?.id) > 0
          ? Number(request.user.id)
          : null;

      const event = await this.usersService.createManualTimelineEvent(id, adminUserId, body);
      return {
        message: 'Evento de timeline criado com sucesso.',
        event
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao criar evento de timeline.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Get(':id/whatsapp-link')
  async whatsappLink(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.usersService.getMemberWhatsAppLink(id);
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao gerar link do WhatsApp.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Delete(':id')
  async remove(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.usersService.deactivateMember(id);
      return { message: 'Membro inativado com sucesso.', user };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao inativar membro.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }
}
