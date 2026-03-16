import { Service } from "@xtaskjs/core";
import { AppConfig } from "../../shared/infrastructure/config/app-config";
import { LOGIN_CHALLENGE_MAX_AGE_MS, SESSION_MAX_AGE_MS } from "../domain/session";
import type { SessionPrincipal } from "../../users/application/user.service";

const jsonwebtoken = require("jsonwebtoken") as {
  sign: (payload: Record<string, any>, secret: string, options?: Record<string, any>) => string;
  verify: (token: string, secret: string, options?: Record<string, any>) => Record<string, any>;
};

export type LoginChallengeToken = {
  readonly userId: number;
  readonly email: string;
  readonly redirectTo: string;
};

@Service()
export class SessionTokenService {
  private readonly config = AppConfig;

  issue(principal: SessionPrincipal): string {
    return jsonwebtoken.sign(
      {
        sub: principal.sub,
        id: principal.id,
        fullName: principal.fullName,
        username: principal.username,
        email: principal.email,
        role: principal.role,
        roles: principal.roles,
        typ: "app-session",
      },
      this.config.security.jwtSecret,
      {
        algorithm: "HS256",
        expiresIn: Math.floor(SESSION_MAX_AGE_MS / 1000),
        issuer: this.config.security.issuer,
      }
    );
  }

  issueLoginChallenge(principal: SessionPrincipal, redirectTo: string): string {
    return jsonwebtoken.sign(
      {
        sub: principal.sub,
        id: principal.id,
        email: principal.email,
        redirectTo,
        typ: "login-challenge",
      },
      this.config.security.jwtSecret,
      {
        algorithm: "HS256",
        expiresIn: Math.floor(LOGIN_CHALLENGE_MAX_AGE_MS / 1000),
        issuer: this.config.security.issuer,
      }
    );
  }

  verifyLoginChallenge(token: string): LoginChallengeToken | null {
    try {
      const payload = jsonwebtoken.verify(token, this.config.security.jwtSecret, {
        issuer: this.config.security.issuer,
      });

      if (payload.typ !== "login-challenge") {
        return null;
      }

      const userId = Number(payload.id || payload.sub || 0);
      if (!Number.isFinite(userId) || userId <= 0) {
        return null;
      }

      return {
        userId,
        email: String(payload.email || ""),
        redirectTo: String(payload.redirectTo || "/dashboard"),
      };
    } catch {
      return null;
    }
  }
}