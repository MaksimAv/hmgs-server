import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TokenModule } from './modules/token/token.module';
import { CookieManagerModule } from './modules/cookie-manager/cookie-manager.module';
import { JwtAccessWithUserStrategy } from './strategies/jwt-access-with-user.strategy';

const STRATEGIES = [
  LocalStrategy,
  JwtRefreshStrategy,
  JwtAccessStrategy,
  JwtAccessWithUserStrategy,
];

@Module({
  imports: [UserModule, PassportModule, TokenModule, CookieManagerModule],
  controllers: [AuthController],
  providers: [...STRATEGIES, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
