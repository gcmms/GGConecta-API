import { PartialType } from '@nestjs/swagger';
import { CreateInternalEventDto } from './create-internal-event.dto';

export class UpdateInternalEventDto extends PartialType(CreateInternalEventDto) {}
