import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessWithUserGuard extends AuthGuard('access-with-user') {}
