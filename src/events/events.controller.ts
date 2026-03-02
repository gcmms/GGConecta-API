import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async list() {
    try {
      return await this.eventsService.fetchEvents();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Erro ao buscar eventos do calendário', error);
      const message = error?.message || 'Erro ao buscar eventos do calendário.';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
