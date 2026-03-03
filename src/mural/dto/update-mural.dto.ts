import { PartialType } from '@nestjs/swagger';
import { CreateMuralDto } from './create-mural.dto';

export class UpdateMuralDto extends PartialType(CreateMuralDto) {}
