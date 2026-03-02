import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/constants/roles.enum';
import { CreateMuralDto } from './dto/create-mural.dto';
import { MuralService } from './mural.service';

@ApiTags('Mural')
@Controller('mural')
export class MuralController {
  constructor(private readonly muralService: MuralService) {}

  @Get()
  async list() {
    try {
      return await this.muralService.list();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to list mural items', error);
      throw new HttpException({ message: 'Erro ao listar mural.' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() body: CreateMuralDto) {
    try {
      const item = await this.muralService.create(body);
      return {
        message: 'Aviso criado com sucesso!',
        item
      };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao criar aviso.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const deleted = await this.muralService.remove(id);
      if (!deleted) {
        throw new HttpException('Aviso não encontrado.', HttpStatus.NOT_FOUND);
      }

      return { message: 'Aviso removido com sucesso.' };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao remover aviso.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }
}
