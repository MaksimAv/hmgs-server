import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUserPayload } from '../../modules/auth/types/request';
import { AuthUserPayload } from '../../modules/auth/types/auth';

export const ReqUserPayload = createParamDecorator(
  (key: keyof AuthUserPayload, ctx: ExecutionContext) => {
    const req: RequestWithUserPayload = ctx.switchToHttp().getRequest();
    const value = key ? req.user[key] : req.user;
    return value;
  },
);
