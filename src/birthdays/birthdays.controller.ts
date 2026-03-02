import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../common/constants/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BirthdaysService } from './birthdays.service';
import { BirthdayTemplatesService } from './birthday-templates.service';
import { CreateBirthdayTemplateDto } from './dto/create-birthday-template.dto';
import { ListBirthdaysQueryDto } from './dto/list-birthdays-query.dto';

@ApiTags('Birthdays')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('birthdays')
export class BirthdaysController {
  constructor(
    private readonly birthdaysService: BirthdaysService,
    private readonly birthdayTemplatesService: BirthdayTemplatesService
  ) {}

  @Get()
  async list(@Query() query: ListBirthdaysQueryDto) {
    try {
      return await this.birthdaysService.list(query);
    } catch (error: any) {
      if (error?.status === HttpStatus.BAD_REQUEST) {
        throw error;
      }

      // eslint-disable-next-line no-console
      console.error('Erro ao listar aniversariantes', error);
      throw new HttpException(
        { message: 'Erro ao carregar aniversariantes.' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('templates')
  async listTemplates() {
    try {
      return await this.birthdayTemplatesService.list();
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao listar templates.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }

  @Post('templates')
  async createTemplate(@Body() body: CreateBirthdayTemplateDto) {
    try {
      const template = await this.birthdayTemplatesService.create(body);
      return { message: 'Template criado com sucesso.', template };
    } catch (error: any) {
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Erro ao criar template.'
          : error?.message || 'Erro.';
      throw new HttpException({ message }, status);
    }
  }
}
