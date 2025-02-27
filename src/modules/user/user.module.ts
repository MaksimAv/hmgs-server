import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ProfileController } from './profile.controller';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ProfileController, UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
