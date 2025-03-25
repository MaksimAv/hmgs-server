import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUserPayloadSigned } from '../types/auth';
import { AuthService } from '../auth.service';
import { User } from '../../user/user.entity';

@Injectable()
export class JwtAccessWithUserStrategy extends PassportStrategy(
  Strategy,
  'access-with-user',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly _configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _configService.getOrThrow<string>('JWT_ACCESS_KEY'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthUserPayloadSigned): Promise<User> {
    return await this.authService.getUserBySub(payload.sub);
  }
}
