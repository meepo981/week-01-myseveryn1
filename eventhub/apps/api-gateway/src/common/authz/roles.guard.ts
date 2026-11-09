
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";

import {
  ROLES_KEY,
} from "./roles.decorator";

import type {
  AuthUser,
} from "../../auth/jwt-auth.guard";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<
      Role[] | undefined
    >(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthUser }>();

    if (!request.user) {
      throw new UnauthorizedException("Unauthenticated");
    }

    if (!required.includes(request.user.role as Role)) {
      throw new ForbiddenException("Forbidden");
    }

    return true;
  }
}
