import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUserAccessPayloadSigned } from '../types/auth';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private readonly _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _configService.getOrThrow<string>('JWT_ACCESS_KEY'),
      ignoreExpiration: false,
    });
  }

  validate(payload: AuthUserAccessPayloadSigned) {
    return payload;
  }
}
