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
  Put,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../common/constants/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateInternalEventDto } from './dto/create-internal-event.dto';
import { CreateEventScheduleDto } from './dto/create-event-schedule.dto';
import { SaveMinistryTemplateDto } from './dto/save-ministry-template.dto';
import { UpdateEventAssignmentDto } from './dto/update-event-assignment.dto';
import { UpdateInternalEventDto } from './dto/update-internal-event.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async list() {
    try {
      return await this.eventsService.fetchEvents();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar eventos.';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('schedules/overview')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async schedulesOverview() {
    try {
      return await this.eventsService.listScheduledEventsOverview();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar eventos com escala.';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('internal')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createInternal(@Body() body: CreateInternalEventDto) {
    try {
      const event = await this.eventsService.createInternalEvent(body);
      return { message: 'Evento interno criado com sucesso.', event };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar evento interno.';
      throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('internal/:id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateInternal(@Param('id') idParam: string, @Body() body: UpdateInternalEventDto) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const event = await this.eventsService.updateInternalEvent(id, body);
      return { message: 'Evento interno atualizado com sucesso.', event };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar evento interno.';
      const status = message.toLowerCase().includes('não encontrado')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;
      throw new HttpException({ message }, status);
    }
  }

  @Delete('internal/:id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteInternal(@Param('id') idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      await this.eventsService.deleteInternalEvent(id);
      return { message: 'Evento interno excluído com sucesso.' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir evento interno.';
      const status = message.toLowerCase().includes('não encontrado')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;
      throw new HttpException({ message }, status);
    }
  }

  @Get(':eventKey/schedules')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async listSchedules(@Param('eventKey') eventKey: string) {
    try {
      return await this.eventsService.listEventSchedules(eventKey);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar escalas do evento.';
      throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':eventKey/schedules')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createSchedule(@Param('eventKey') eventKey: string, @Body() body: CreateEventScheduleDto) {
    try {
      return await this.eventsService.createEventSchedule(eventKey, body);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar escala do evento.';
      throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('schedules/assignments/:id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateAssignment(@Param('id') idParam: string, @Body() body: UpdateEventAssignmentDto) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const assignment = await this.eventsService.updateAssignment(id, body);
      return { message: 'Escalado atualizado com sucesso.', assignment };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar vaga da escala.';
      throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('ministry-templates/:ministryId')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async listMinistryTemplates(@Param('ministryId') ministryIdParam: string) {
    const ministryId = Number(ministryIdParam);
    if (!Number.isInteger(ministryId) || ministryId <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.eventsService.listMinistryTemplates(ministryId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar vagas do ministério.';
      throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('ministry-templates/:ministryId')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async saveMinistryTemplates(
    @Param('ministryId') ministryIdParam: string,
    @Body() body: SaveMinistryTemplateDto
  ) {
    const ministryId = Number(ministryIdParam);
    if (!Number.isInteger(ministryId) || ministryId <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const templates = await this.eventsService.saveMinistryTemplates(ministryId, body);
      return { message: 'Vagas padrão salvas com sucesso.', ...templates };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar vagas do ministério.';
      throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
    }
  }
}
