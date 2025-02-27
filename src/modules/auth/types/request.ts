import { Request } from 'express';
import { AuthUserPayloadSigned } from './auth';

export interface RequestWithUser extends Request {
  user: AuthUserPayloadSigned;
}
export interface RequestWithCookie extends Request {
  cookies: {
    [key: string]: string | undefined;
  };
}
