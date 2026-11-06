
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";

import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import {
  registerBody,
  loginBody
} from "./auth.schemas";

import { JwtAuthGuard, type AuthUser } from "./jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenService
  ) {}

  private setCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth",
      maxAge:
        Number(process.env.REFRESH_TTL_DAYS || 30) *
        86_400_000
    });
  }

  private clearCookie(res: Response) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth"
    });
  }

  @Post("register")
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response
  ) {
    const parsed = registerBody.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException("Invalid registration data");
    }

    const result = await this.auth.register(parsed.data);
    this.setCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user
    };
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response
  ) {
    const parsed = loginBody.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException("Invalid login data");
    }

    const result = await this.auth.login(parsed.data);
    this.setCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user
    };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const raw = req.cookies?.refreshToken;

    if (typeof raw !== "string") {
      throw new BadRequestException("Refresh cookie missing");
    }

    try {
      const result = await this.tokens.rotate(raw);
      this.setCookie(res, result.refreshToken);

      return { accessToken: result.accessToken };
    } catch (error) {
      this.clearCookie(res);
      throw error;
    }
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const raw = req.cookies?.refreshToken;

    if (typeof raw === "string") {
      await this.tokens.logout(raw);
    }

    this.clearCookie(res);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
