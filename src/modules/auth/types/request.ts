import { Request } from 'express';
import { AuthUserPayloadSigned } from './auth';
import { User } from '../../user/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}
export interface RequestWithUserPayload extends Request {
  user: AuthUserPayloadSigned;
}
export interface RequestWithCookie extends Request {
  cookies: {
    [key: string]: string | undefined;
  };
}
