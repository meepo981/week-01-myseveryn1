
import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";

import {
  OAuth2Client,
  CodeChallengeMethod,
} from "google-auth-library";
import { createHash, randomBytes } from "node:crypto";


export type GoogleFlow = {
  state: string;
  verifier: string;
  nonce: string;
  createdAt: number;
};

export type GoogleIdentity = {
  sub: string;
  email: string;
};

@Injectable()
export class GoogleAuthService {
  private get client(): OAuth2Client {
    const id = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect = process.env.GOOGLE_REDIRECT_URI;

    if (!id || !secret || !redirect) {
      throw new ServiceUnavailableException(
        "Google login is not configured"
      );
    }

    return new OAuth2Client(id, secret, redirect);
  }

  start() {
    const flow: GoogleFlow = {
      state: randomBytes(32).toString("base64url"),
      verifier: randomBytes(32).toString("base64url"),
      nonce: randomBytes(32).toString("base64url"),
      createdAt: Date.now(),
    };

    const challenge = createHash("sha256")
      .update(flow.verifier)
      .digest("base64url");

    const url = this.client.generateAuthUrl({
      response_type: "code",
      scope: ["openid", "email", "profile"],
      state: flow.state,
      nonce: flow.nonce,
      code_challenge: challenge,
      code_challenge_method: CodeChallengeMethod.S256,
      prompt: "select_account",
    });

    return { url, flow };
  }

  async finish(
    code: string,
    flow: GoogleFlow
  ): Promise<GoogleIdentity> {
    const client = this.client;

    const { tokens } = await client.getToken({
      code,
      codeVerifier: flow.verifier,
    });

    if (!tokens.id_token) {
      throw new UnauthorizedException(
        "Google ID token missing"
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const claims = ticket.getPayload();

    if (
      !claims ||
      !claims.sub ||
      !claims.email ||
      claims.email_verified !== true ||
      claims.nonce !== flow.nonce
    ) {
      throw new UnauthorizedException(
        "Google identity verification failed"
      );
    }

    return {
      sub: claims.sub,
      email: claims.email.trim().toLowerCase(),
    };
  }
  
}
