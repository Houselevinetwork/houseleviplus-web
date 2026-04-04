// src/user-and-monetization/auth/guards/roles.guard.ts - FIXED VERSION
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleService } from '../../role/role.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    // ✅ Now JWT should have roleId
    if (!user.roleId) {
      this.logger.error(`No roleId in JWT payload. JWT payload: ${JSON.stringify(user)}`);
      this.logger.error('Please ensure auth.service.ts generateAccessToken() includes roleId');
      return false;
    }

    // ✅ Query database with roleId from JWT
    const role = await this.roleService.findById(user.roleId);

    if (!role) {
      this.logger.warn(`Role not found for user: ${user.userId}, roleId: ${user.roleId}`);
      return false;
    }

    const hasRole = requiredRoles.includes(role.name);

    if (!hasRole) {
      this.logger.warn(
        `User ${user.userId} with role "${role.name}" attempted to access route requiring: ${requiredRoles.join(', ')}`,
      );
    } else {
      this.logger.debug(`✅ User ${user.userId} authorized with role "${role.name}"`);
    }

    return hasRole;
  }
}