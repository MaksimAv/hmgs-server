import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../modules/auth/types/request';
import { User } from '../../modules/user/user.entity';

export const ReqUser = createParamDecorator(
  (key: keyof User, ctx: ExecutionContext) => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    const value = key ? req.user[key] : req.user;
    return value;
  },
);
