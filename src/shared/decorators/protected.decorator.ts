import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessGuard } from '../../modules/auth/guards/access.guard';
import { AccessWithUserGuard } from '../../modules/auth/guards/access-with-user.guard';

type UserInfo = 'payload' | 'loadUser';

export function Protected(userInfo: UserInfo = 'loadUser') {
  return applyDecorators(
    UseGuards(userInfo === 'loadUser' ? AccessWithUserGuard : AccessGuard),
  );
}
