import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  getHealth() {
    return { message: 'IPIGGConecta API is running' };
  }
}
