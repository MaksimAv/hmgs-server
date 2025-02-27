import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../modules/auth/types/request';
import { AuthUserPayload } from '../../modules/auth/types/auth';

export const ReqUser = createParamDecorator(
  (key: keyof AuthUserPayload, ctx: ExecutionContext) => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    const value = key ? req.user[key] : req.user;
    return value;
  },
);
