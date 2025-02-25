import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../types/request';
import { UserRoleType } from '../../user/types/user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    if (!req.user) throw new UnauthorizedException('Missing user in request');
    const roles: UserRoleType[] = this.reflector.get('roles', ctx.getHandler());
    if (!roles || roles.length === 0) return false;
    return roles.includes(req.user.role);
  }
}
