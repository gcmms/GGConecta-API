import { PartialType } from '@nestjs/swagger';
import { CreateAccessProfileDto } from './create-access-profile.dto';

export class UpdateAccessProfileDto extends PartialType(CreateAccessProfileDto) {}

