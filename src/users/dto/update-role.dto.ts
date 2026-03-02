import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../common/constants/roles.enum';

const allowedRoles = [Role.MEMBER, Role.ADMIN, Role.NON_MEMBER];

export class UpdateRoleDto {
  @ApiProperty({ enum: allowedRoles })
  @IsString()
  @IsNotEmpty()
  @IsIn(allowedRoles)
  role: string;
}
