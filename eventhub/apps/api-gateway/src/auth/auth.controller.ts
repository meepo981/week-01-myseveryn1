
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
import { Query, ConflictException } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import {
  GoogleAuthService,
  type GoogleFlow,
} from "./google-auth.service";
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
  private readonly tokens: TokenService,
  private readonly google: GoogleAuthService
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

@Get("google")
googleStart(
  @Res() res: Response
) {
  const { url, flow } = this.google.start();

  res.cookie(
    "oauthFlow",
    Buffer.from(JSON.stringify(flow)).toString("base64url"),
    {
      signed: true,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/auth",
      maxAge: 10 * 60 * 1000,
    }
  );

  return res.redirect(url);
}

@Get("google/callback")
async googleCallback(
  @Query("code") code: string | undefined,
  @Query("state") state: string | undefined,
  @Query("error") error: string | undefined,
  @Req() req: Request,
  @Res() res: Response
) {
  const cookie = req.signedCookies?.oauthFlow;

  res.clearCookie("oauthFlow", {
    path: "/auth",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (error) {
    return res.redirect("/login?oauthError=cancelled");
  }

  try {
    if (typeof cookie !== "string" || !code || !state) {
      throw new Error("Invalid OAuth flow");
    }

    const flow = JSON.parse(
      Buffer.from(cookie, "base64url").toString("utf8")
    ) as GoogleFlow;

    if (
      typeof flow.state !== "string" ||
      typeof flow.verifier !== "string" ||
      typeof flow.nonce !== "string" ||
      typeof flow.createdAt !== "number" ||
      flow.createdAt > Date.now() ||
      Date.now() - flow.createdAt > 10 * 60 * 1000
    ) {
      throw new Error("Invalid OAuth flow");
    }

    const expected = Buffer.from(flow.state);
    const actual = Buffer.from(state);

    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      throw new Error("OAuth state mismatch");
    }

    const identity = await this.google.finish(code, flow);
    const user = await this.auth.loginWithGoogle(identity);

    const pair = await this.tokens.issuePair(user);
    this.setCookie(res, pair.refreshToken);

    return res.redirect("/me");
  } catch (err) {
    const reason = err instanceof ConflictException
      ? "account_exists"
      : "invalid_flow";

    return res.redirect(
      `/login?oauthError=${encodeURIComponent(reason)}`
    );
  }
}

}
