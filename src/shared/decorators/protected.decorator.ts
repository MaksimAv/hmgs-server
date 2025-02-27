import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessGuard } from '../../modules/auth/guards/access.guard';

export function Protected() {
  return applyDecorators(UseGuards(AccessGuard));
}
