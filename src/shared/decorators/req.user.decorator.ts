import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../modules/user/user.entity';
import { RequestWithUser } from '../../modules/auth/types/request';

export const ReqUser = createParamDecorator(
  (key: keyof User, ctx: ExecutionContext) => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    if (!req.user) throw new UnauthorizedException('Missing user on request');
    const user = key ? req.user[key] : req.user;
    return user;
  },
);
