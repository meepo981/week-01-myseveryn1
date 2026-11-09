
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException
} from "@nestjs/common";

import { Prisma } from "@prisma/client";
import * as argon2 from "argon2";

import { PrismaService } from "../prisma/prisma.service";
import { TokenService } from "./token.service";
import type { GoogleIdentity } from "./google-auth.service";
import type {
  RegisterBody,
  LoginBody
} from "./auth.schemas";

@Injectable()
export class AuthService {
  private dummyHash: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService
  ) {
    this.dummyHash = argon2.hash(
      "dummy-password-not-used-for-login",
      {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3
      }
    );
  }

  private toUserDto(user: {
    id: string;
    email: string;
    role: string;
  }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  }

  async register(body: RegisterBody) {
    const passwordHash = await argon2.hash(
      body.password,
      {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3
      }
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          passwordHash
        }
      });

      const pair = await this.tokens.issuePair(user);

      return {
        user: this.toUserDto(user),
        ...pair
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email already registered");
      }

      throw error;
    }
  }

  async login(body: LoginBody) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email }
    });

    const hash = user?.passwordHash ?? await this.dummyHash;

    const valid = await argon2.verify(hash, body.password);

    if (!user || !valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const pair = await this.tokens.issuePair(user);

    return {
      user: this.toUserDto(user),
      ...pair
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.toUserDto(user);
  }

async loginWithGoogle(identity: GoogleIdentity) {
  const linked = await this.prisma.oAuthAccount.findUnique({
    where: {
      provider_providerSubject: {
        provider: "google",
        providerSubject: identity.sub,
      },
    },
    include: { user: true },
  });


  if (linked) {
    return linked.user;
  }


  const existing = await this.prisma.user.findUnique({
    where: { email: identity.email },
  });

  if (existing) {

    if (!existing.emailVerified) {
      throw new ConflictException(
        "Account exists with password"
      );
    }


    await this.prisma.oAuthAccount.create({
      data: {
        userId: existing.id,
        provider: "google",
        providerSubject: identity.sub,
      },
    });

    return existing;
  }


  return this.prisma.user.create({
    data: {
      email: identity.email,
      emailVerified: true,
      oauthAccounts: {
        create: {
          provider: "google",
          providerSubject: identity.sub,
        },
      },
    },
  });
}

}
