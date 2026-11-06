
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";

export type AuthUser = {
  id: string;
  role: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{
        headers: { authorization?: string };
        user?: AuthUser;
      }>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Unauthenticated");
    }

    try {
      const secret = process.env.JWT_ACCESS_SECRET;

      if (!secret) {
        throw new Error("JWT secret missing");
      }

      const payload = await this.jwt.verifyAsync<{
        sub: string;
        role: string;
      }>(
        authorization.slice(7),
        { secret }
      );

      if (!payload.sub || !payload.role) {
        throw new Error("Invalid payload");
      }

      request.user = {
        id: payload.sub,
        role: payload.role
      };

      return true;
    } catch {
      throw new UnauthorizedException("Unauthenticated");
    }
  }
}
