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

const STRATEGIES = [LocalStrategy, JwtRefreshStrategy, JwtAccessStrategy];

@Module({
  imports: [UserModule, PassportModule, TokenModule, CookieManagerModule],
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES],
  exports: [AuthService],
})
export class AuthModule {}
