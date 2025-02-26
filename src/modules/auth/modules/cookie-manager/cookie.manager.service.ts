import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TokenService } from '../token/token.service';
import { COOKIE_REFRESH_TOKEN } from '../../auth.api.constants';
import { timeToMilliseconds } from '../../../../shared/utils/time.to.milliseconds';

@Injectable()
export class CookieManagerService {
  constructor(private readonly tokenService: TokenService) {}

  setAuthCookie(res: Response, refreshToken: string, path: string) {
    const refreshTtl = this.tokenService.getRefreshTtl();
    res.cookie(COOKIE_REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: timeToMilliseconds(refreshTtl),
      path,
    });
  }

  clearAuthCookie(res: Response, path: string) {
    res.clearCookie(COOKIE_REFRESH_TOKEN, {
      httpOnly: true,
      sameSite: 'strict',
      path,
    });
  }
}
