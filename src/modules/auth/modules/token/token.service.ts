import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  AuthTokenPair,
  AuthUserPayload,
  AuthUserPayloadRefresh,
} from '../../types/auth';

@Injectable()
export class TokenService {
  private jwtAccessKey: string;
  private jwtRefreshKey: string;
  private jwtAccessTtl: string;
  private jwtRefreshTtl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {
    this.jwtAccessKey = _configService.getOrThrow('JWT_ACCESS_KEY');
    this.jwtRefreshKey = _configService.getOrThrow('JWT_REFRESH_KEY');
    this.jwtAccessTtl = _configService.getOrThrow('JWT_ACCESS_TTL');
    this.jwtRefreshTtl = _configService.getOrThrow('JWT_REFRESH_TTL');
  }

  getAccessTtl() {
    return this.jwtAccessTtl;
  }

  getRefreshTtl() {
    return this.jwtRefreshTtl;
  }

  async generatePair(payload: AuthUserPayload): Promise<AuthTokenPair> {
    return {
      accessToken: await this.generateAccess(payload),
      refreshToken: await this.generateRefresh(payload),
    };
  }

  async generateAccess({ sub, role }: AuthUserPayload): Promise<string> {
    return await this.jwtService.signAsync(
      { role },
      {
        subject: sub,
        secret: this.jwtAccessKey,
        expiresIn: this.jwtAccessTtl,
      },
    );
  }

  async generateRefresh({ sub }: AuthUserPayloadRefresh): Promise<string> {
    return await this.jwtService.signAsync(
      {},
      {
        subject: sub,
        secret: this.jwtRefreshKey,
        expiresIn: this.jwtRefreshTtl,
      },
    );
  }
}
