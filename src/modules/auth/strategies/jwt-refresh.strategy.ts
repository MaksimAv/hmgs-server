import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { COOKIE_REFRESH_TOKEN } from '../auth.api.constants';
import { AuthService } from '../auth.service';
import { AuthUserRefreshPayloadSigned } from '../types/auth';
import { RequestWithCookie } from '../types/request';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly authService: AuthService,
    private readonly _configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => JwtRefreshStrategy.extractFromCookie(req),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: _configService.getOrThrow<string>('JWT_REFRESH_KEY'),
      ignoreExpiration: true,
    });
  }

  private static extractFromCookie(req: RequestWithCookie): string | null {
    const token = req.cookies[COOKIE_REFRESH_TOKEN] || null;
    return token;
  }

  async validate(payload: AuthUserRefreshPayloadSigned) {
    return await this.authService.getUserBySub(payload.sub);
  }
}
