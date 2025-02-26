import { JwtPayload } from 'jsonwebtoken';
import { UserRoleEnum } from '../../user/user-role.enum';

export type AuthTokenPair = { accessToken: string; refreshToken: string };
export type AuthUserAccessPayload = {
  sub: string;
  role: UserRoleEnum;
  firstName: string;
  lastName: string;
};
export type AuthUserRefreshPayload = { sub: string };
export type AuthUserPayload = AuthUserAccessPayload & AuthUserRefreshPayload;
export type AuthUserRefreshPayloadSigned = JwtPayload & AuthUserRefreshPayload;
export type AuthUserAccessPayloadSigned = JwtPayload & AuthUserAccessPayload;
