import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../common/constants/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AccessProfilesService } from './access-profiles.service';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';

@ApiTags('Access Profiles')
@ApiBearerAuth('bearerAuth')
@Controller('access-profiles')
export class AccessProfilesController {
  constructor(private readonly accessProfilesService: AccessProfilesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async list() {
    try {
      return await this.accessProfilesService.list();
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao listar perfis de acesso.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('effective')
  async effective(@Req() req: any) {
    try {
      const profile = await this.accessProfilesService.getEffectiveProfileForUser(
        Number(req.user?.id),
        req.user?.role
      );
      return {
        role: req.user?.role || null,
        profile
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao carregar perfil efetivo.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() body: CreateAccessProfileDto) {
    try {
      const profile = await this.accessProfilesService.create(body);
      return { message: 'Perfil criado com sucesso.', profile };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao criar perfil.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') idParam: string, @Body() body: UpdateAccessProfileDto) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const profile = await this.accessProfilesService.update(id, body);
      return { message: 'Perfil atualizado com sucesso.', profile };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao atualizar perfil.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      await this.accessProfilesService.remove(id);
      return { message: 'Perfil removido com sucesso.' };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao remover perfil.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }
}
