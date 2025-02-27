// roles.decorator.ts
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { UserRoleType } from '../../modules/user/types/user';
import { AccessGuard } from '../../modules/auth/guards/access.guard';

export const RolesProtected = (...roles: UserRoleType[]) =>
  applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AccessGuard, RolesGuard),
  );
