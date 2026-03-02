import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Body,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/constants/roles.enum';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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
