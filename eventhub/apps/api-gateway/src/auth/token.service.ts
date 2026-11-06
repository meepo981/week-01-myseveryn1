
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import { createHash, randomBytes, randomUUID } from "node:crypto";

type TokenUser = {
  id: string;
  role: Role;
};

function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  private get secret(): string {
    const value = process.env.JWT_ACCESS_SECRET;
    if (!value || value.length < 32) {
      throw new Error("JWT_ACCESS_SECRET is missing or too short");
    }
    return value;
  }

  private get refreshDays(): number {
    return Number(process.env.REFRESH_TTL_DAYS || 30);
  }

    async issuePair(
    user: TokenUser,
    familyId: string = randomUUID()
    ) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: this.secret,
        expiresIn: Number(
          process.env.JWT_ACCESS_TTL_SECONDS || 900
        )
      }
    );

    const refreshToken = randomBytes(32).toString("base64url");

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        familyId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(
          Date.now() + this.refreshDays * 86_400_000
        )
      }
    });

    return { accessToken, refreshToken };
  }

  async revokeFamily(familyId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async rotate(raw: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(raw) },
      include: { user: true }
    });

    if (!token) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (token.usedAt) {
      await this.revokeFamily(token.familyId);

      this.logger.warn(
        `refresh token reuse detected; familyId=${token.familyId}`
      );

      throw new UnauthorizedException("Invalid refresh token");
    }

    if (token.revokedAt || token.expiresAt <= new Date()) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const now = new Date();

    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id: token.id,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: now }
      },
      data: { usedAt: now }
    });

    if (result.count !== 1) {
      await this.revokeFamily(token.familyId);

      this.logger.warn(
        `refresh token reuse detected; familyId=${token.familyId}`
      );

      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.issuePair(token.user, token.familyId);
  }

  async logout(raw: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(raw) }
    });

    if (token) {
      await this.revokeFamily(token.familyId);
    }
  }
}
