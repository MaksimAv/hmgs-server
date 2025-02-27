import { JwtPayload } from 'jsonwebtoken';
import { UserRoleEnum } from '../../user/user-role.enum';

export type AuthTokenPair = { accessToken: string; refreshToken: string };
export type AuthUserPayload = {
  sub: string;
  role: UserRoleEnum;
  firstName: string;
  lastName: string;
};
export type AuthUserPayloadSigned = JwtPayload & AuthUserPayload;
export type AuthUserPayloadRefresh = Pick<AuthUserPayload, 'sub'>;
export type AuthUserPayloadRefreshSigned = JwtPayload & AuthUserPayloadRefresh;
