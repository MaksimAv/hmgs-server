import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { CookieManagerService } from './services/cookie.manager.service';
import { TokenService } from './services/token.service';
import { JwtRefreshStrategy } from './strategies/jwt.refresh.strategy';
import { JwtAccessStrategy } from './strategies/jwt.access.strategy';
import { LocalStrategy } from './strategies/local.strategy';

const STRATEGIES = [LocalStrategy, JwtRefreshStrategy, JwtAccessStrategy];

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      signOptions: {
        algorithm: 'HS256',
        issuer: 'hmgs-api',
        audience: ['hmgs-web'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CookieManagerService, TokenService, ...STRATEGIES],
  exports: [AuthService],
})
export class AuthModule {}
