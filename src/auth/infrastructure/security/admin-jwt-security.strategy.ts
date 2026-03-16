import { JwtSecurityStrategy } from "@xtaskjs/security";
import { AppConfig } from "../../../shared/infrastructure/config/app-config";
import { AuthService } from "../../application/auth.service";
import { readSessionToken } from "../../domain/session";

const readBearerOrSessionToken = (request: any): string | null => {
  const authorizationHeader = request?.headers?.authorization || request?.headers?.Authorization;
  if (typeof authorizationHeader === "string") {
    const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]) {
      return match[1];
    }
  }

  return readSessionToken(request);
};

@JwtSecurityStrategy({
  name: "app-session",
  default: true,
  secretOrKey: AppConfig.security.jwtSecret,
  issuer: AppConfig.security.issuer,
  jwtFromRequest: readBearerOrSessionToken,
  validate: async (payload, context) => {
    if (payload.typ !== "app-session") {
      return false;
    }

    const userId = Number(payload.id || payload.sub || 0);
    if (!Number.isFinite(userId) || userId <= 0) {
      return false;
    }

    const authService = context.container?.get(AuthService);
    const principal = await authService?.resolvePrincipalById(userId);
    if (!principal) {
      return false;
    }

    return {
      ...principal,
      claims: payload,
    };
  },
})
export class AppSessionSecurityStrategy {}