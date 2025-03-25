import { Module } from '@nestjs/common';
import { CookieManagerService } from './cookie-manager.service';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TokenModule],
  providers: [CookieManagerService],
  exports: [CookieManagerService],
})
export class CookieManagerModule {}
