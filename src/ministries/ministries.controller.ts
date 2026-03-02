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
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { MinistriesService } from './ministries.service';

@ApiTags('Ministries')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('ministries')
export class MinistriesController {
  constructor(private readonly ministriesService: MinistriesService) {}

  @Get()
  async list() {
    try {
      return await this.ministriesService.list();
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao listar ministérios.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Get(':id')
  async findOne(@Param('id') idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.ministriesService.findById(id);
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao carregar ministério.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Post()
  async create(@Body() body: CreateMinistryDto) {
    try {
      const ministry = await this.ministriesService.create(body);
      return { message: 'Ministério criado com sucesso.', ministry };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao criar ministério.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Patch(':id')
  async update(@Param('id') idParam: string, @Body() body: UpdateMinistryDto) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const ministry = await this.ministriesService.update(id, body);
      return { message: 'Ministério atualizado com sucesso.', ministry };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao atualizar ministério.'
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
      await this.ministriesService.remove(id);
      return { message: 'Ministério removido com sucesso.' };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao remover ministério.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }
}
