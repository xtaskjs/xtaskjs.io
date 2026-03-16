import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Body, Controller, Get, Post, Query, Req, Res } from "@xtaskjs/common";
import { view } from "@xtaskjs/express-http";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import {
  AllowAnonymous,
} from "@xtaskjs/security";
import { AccountAccessService } from "../../application/account-access.service";
import { SessionTokenService } from "../../application/admin-session-token.service";
import { LOGIN_CHALLENGE_COOKIE_NAME, LOGIN_CHALLENGE_MAX_AGE_MS, SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from "../../domain/session";
import { normalizeText } from "../../../shared/infrastructure/http/view-helpers";
import { SessionViewService } from "../../application/session-view.service";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

const shouldUseSecureCookies = (req: Request): boolean => {
  if (req.secure) {
    return true;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (Array.isArray(forwardedProto)) {
    return forwardedProto.some((value) => String(value).split(",").some((item) => item.trim() === "https"));
  }

  return typeof forwardedProto === "string" && forwardedProto.split(",").some((value) => value.trim() === "https");
};

const buildCookieOptions = (req: Request) => ({
  ...baseCookieOptions,
  secure: shouldUseSecureCookies(req),
});

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === "string" ? value.trim() : value;

class AdminLoginPageQueryDto {
  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  expired?: string;
}

class AdminLoginBodyDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Service()
@Controller("/admin")
export class AuthController {
  @AutoWired({ qualifier: AccountAccessService.name })
  private readonly accountAccessService!: AccountAccessService;

  @AutoWired({ qualifier: SessionTokenService.name })
  private readonly tokenService!: SessionTokenService;

  @AutoWired({ qualifier: SessionViewService.name })
  private readonly sessionViewService!: SessionViewService;

  @AllowAnonymous()
  @Get("/login")
  async loginPage(
    @Query() query: AdminLoginPageQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const viewer = await this.sessionViewService.getViewer(req, res);
    if (viewer?.isAdmin) {
      res.redirect("/admin/users");
      return;
    }

    if (viewer) {
      res.redirect("/dashboard");
      return;
    }

    return view("admin-login", {
      titleKey: "auth.admin.metaTitle",
      viewer: null,
      hasError: query.error === "1",
      infoMessageKey: query.expired === "1" ? "auth.admin.expired" : undefined,
    });
  }

  @AllowAnonymous()
  @Post("/login")
  async login(@Body() body: AdminLoginBodyDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const username = normalizeText(body.username);
    const password = body.password;

    const result = await this.accountAccessService.beginLogin(username, password, "admin");
    if (result.status === "invalid") {
      res.redirect("/admin/login?error=1");
      return;
    }

    if (result.status === "verification-required") {
      res.redirect(`/verify-email?email=${encodeURIComponent(result.email)}&sent=1`);
      return;
    }

    const token = this.tokenService.issueLoginChallenge(result.principal, "/admin/news");
    res.cookie(LOGIN_CHALLENGE_COOKIE_NAME, token, {
      ...buildCookieOptions(req),
      maxAge: LOGIN_CHALLENGE_MAX_AGE_MS,
    });
    res.redirect("/login/verify");
  }

  @AllowAnonymous()
  @Post("/logout")
  logout(req: Request, res: Response): void {
    res.clearCookie(LOGIN_CHALLENGE_COOKIE_NAME, buildCookieOptions(req));
    res.clearCookie(SESSION_COOKIE_NAME, buildCookieOptions(req));
    res.redirect("/admin/login");
  }
}