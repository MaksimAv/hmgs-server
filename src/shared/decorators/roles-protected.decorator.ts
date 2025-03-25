import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { UserRoleType } from '../../modules/user/types/user';
import { Protected } from './protected.decorator';

type UserInfo = 'payload' | 'loadUser';

export const RolesProtected = (
  roles: UserRoleType[],
  userInfo: UserInfo = 'loadUser',
) =>
  applyDecorators(
    Protected(userInfo),
    SetMetadata('roles', roles),
    UseGuards(RolesGuard),
  );
