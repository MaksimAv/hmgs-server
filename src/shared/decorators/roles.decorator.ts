// roles.decorator.ts
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { UserRoleType } from '../../modules/user/types/user';

export const Roles = (...roles: UserRoleType[]) =>
  applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));
