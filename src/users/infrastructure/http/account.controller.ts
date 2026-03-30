import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Body, Controller, Get, Post, Query, Req, Res } from "@xtaskjs/common";
import { CommandBus, InjectCommandBus } from "@xtaskjs/cqrs";
import { view } from "@xtaskjs/express-http";
import { AllowAnonymous, Authenticated } from "@xtaskjs/security";
import { Transform } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from "class-validator";
import { SessionViewService } from "../../../auth/application/session-view.service";
import { AccountAccessService } from "../../../auth/application/account-access.service";
import { RegisterAccountCommand, type RegisterAccountResult } from "../../../auth/application/cqrs/account-registration.messages";
import { SessionTokenService } from "../../../auth/application/admin-session-token.service";
import {
  LOGIN_CHALLENGE_COOKIE_NAME,
  LOGIN_CHALLENGE_MAX_AGE_MS,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  readLoginChallengeToken,
} from "../../../auth/domain/session";
import { UserService } from "../../application/user.service";
import { resolveRequestAccessLocation } from "../../../shared/infrastructure/http/request-access-location";
import { normalizeText } from "../../../shared/infrastructure/http/view-helpers";

type AuthenticatedRequest = Request & {
  user?: { id?: number };
  auth?: { user?: { id?: number } };
};

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

const dashboardPathForRole = (roles: string[]): string => (roles.includes("admin") ? "/admin/users" : "/dashboard");

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === "string" ? value.trim() : value;

const trimLowercaseString = ({ value }: { value: unknown }): unknown =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

const parseCheckboxValue = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some((entry) => parseCheckboxValue(entry));
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "on" || normalized === "true" || normalized === "1" || normalized === "yes";
};

class LoginPageQueryDto {
  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  verified?: string;

  @IsOptional()
  @IsString()
  reset?: string;

  @IsOptional()
  @IsString()
  expired?: string;
}

class LoginBodyDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

class RegisterPageQueryDto {
  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

class RegisterBodyDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @Transform(trimLowercaseString)
  @IsString()
  @IsNotEmpty()
  username!: string;

  @Transform(trimLowercaseString)
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  receiveNewsUpdates?: string;

  @IsOptional()
  @IsString()
  newsletterSubscribed?: string;
}

class DashboardQueryDto {
  @IsOptional()
  @IsString()
  preferences?: string;
}

class DashboardNewsletterBodyDto {
  @IsOptional()
  @IsString()
  newsletterSubscribed?: string;
}

class VerifyEmailQueryDto {
  @Transform(trimLowercaseString)
  @IsOptional()
  @IsEmail()
  email?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  sent?: string;
}

class VerifyEmailBodyDto {
  @Transform(trimLowercaseString)
  @IsEmail()
  email!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  code!: string;
}

class ResendVerifyEmailBodyDto {
  @Transform(trimLowercaseString)
  @IsEmail()
  email!: string;
}

class VerifyLoginPageQueryDto {
  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  resent?: string;
}

class VerifyLoginBodyDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  code!: string;
}

class ForgotPasswordBodyDto {
  @Transform(trimLowercaseString)
  @IsEmail()
  email!: string;
}

class ResetPasswordQueryDto {
  @Transform(trimLowercaseString)
  @IsOptional()
  @IsEmail()
  email?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsString()
  error?: string;
}

class ResetPasswordBodyDto {
  @Transform(trimLowercaseString)
  @IsEmail()
  email!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}

@Service()
@Controller()
export class AccountController {
  @AutoWired({ qualifier: AccountAccessService.name })
  private readonly accountAccessService!: AccountAccessService;

  @InjectCommandBus()
  private readonly commandBus!: CommandBus;

  @AutoWired({ qualifier: SessionTokenService.name })
  private readonly tokenService!: SessionTokenService;

  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  @AutoWired({ qualifier: SessionViewService.name })
  private readonly sessionViewService!: SessionViewService;

  @AllowAnonymous()
  @Get("/login")
  async loginPage(
    @Query() query: LoginPageQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const viewer = await this.sessionViewService.getViewer(req, res);
    if (viewer) {
      res.redirect(viewer.accountHref);
      return;
    }

    return view("login", {
      titleKey: "auth.login.metaTitle",
      viewer: null,
      hasError: query.error === "1",
      infoMessageKey:
        query.verified === "1"
          ? "auth.login.verified"
          : query.reset === "1"
            ? "auth.login.reset"
            : query.expired === "1"
              ? "auth.login.expired"
              : undefined,
    });
  }

  @AllowAnonymous()
  @Post("/login")
  async login(@Body() body: LoginBodyDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const identifier = normalizeText(body.identifier);
    const password = body.password;

    const result = await this.accountAccessService.beginLogin(identifier, password);
    if (result.status === "invalid") {
      res.redirect("/login?error=1");
      return;
    }

    if (result.status === "verification-required") {
      res.redirect(`/verify-email?email=${encodeURIComponent(result.email)}&sent=1`);
      return;
    }

    const token = this.tokenService.issueLoginChallenge(result.principal, dashboardPathForRole(result.principal.roles));
    res.cookie(LOGIN_CHALLENGE_COOKIE_NAME, token, {
      ...buildCookieOptions(req),
      maxAge: LOGIN_CHALLENGE_MAX_AGE_MS,
    });
    res.redirect("/login/verify");
  }

  @AllowAnonymous()
  @Get("/register")
  async registerPage(
    @Query() query: RegisterPageQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const viewer = await this.sessionViewService.getViewer(req, res);
    if (viewer) {
      res.redirect(viewer.accountHref);
      return;
    }

    return view("register", {
      titleKey: "auth.register.metaTitle",
      viewer: null,
      hasError: query.error === "1",
      errorMessage: query.message,
      form: { fullName: "", username: "", email: "", receiveNewsUpdates: false, newsletterSubscribed: false },
    });
  }

  @AllowAnonymous()
  @Post("/register")
  async register(@Body() body: RegisterBodyDto, @Req() req: Request, @Res() res: Response): Promise<ReturnType<typeof view> | void> {
    const fullName = normalizeText(body.fullName);
    const username = normalizeText(body.username);
    const email = normalizeText(body.email);
    const password = body.password;
    const confirmPassword = body.confirmPassword;
    const receiveNewsUpdates = parseCheckboxValue(body.receiveNewsUpdates);
    const newsletterSubscribed = parseCheckboxValue(body.newsletterSubscribed);

    const form = { fullName, username, email, receiveNewsUpdates, newsletterSubscribed };

    if (!fullName || !username || !email || !password || !confirmPassword) {
      return view(
        "register",
        {
          titleKey: "auth.register.metaTitle",
          viewer: null,
          hasError: true,
          errorMessageKey: "auth.register.allFieldsRequired",
          form,
        },
        400
      );
    }

    if (password.length < 8) {
      return view(
        "register",
        {
          titleKey: "auth.register.metaTitle",
          viewer: null,
          hasError: true,
          errorMessageKey: "auth.register.passwordLength",
          form,
        },
        400
      );
    }

    if (password !== confirmPassword) {
      return view(
        "register",
        {
          titleKey: "auth.register.metaTitle",
          viewer: null,
          hasError: true,
          errorMessageKey: "auth.register.passwordMismatch",
          form,
        },
        400
      );
    }

    if (!newsletterSubscribed) {
      return view(
        "register",
        {
          titleKey: "auth.register.metaTitle",
          viewer: null,
          hasError: true,
          errorMessageKey: "auth.register.privacyConsentRequired",
          form,
        },
        400
      );
    }

    try {
      const result = await this.commandBus.execute<RegisterAccountResult>(
        new RegisterAccountCommand(
          fullName,
          username,
          email,
          password,
          receiveNewsUpdates,
          newsletterSubscribed,
          resolveRequestAccessLocation(req)
        )
      );
      res.redirect(`/verify-email?email=${encodeURIComponent(result.email)}&sent=1`);
      return;
    } catch (error: unknown) {
      return view(
        "register",
        {
          titleKey: "auth.register.metaTitle",
          viewer: null,
          hasError: true,
          errorMessage: error instanceof Error ? error.message : undefined,
          errorMessageKey: error instanceof Error ? undefined : "auth.register.unableToCreate",
          form,
        },
        400
      );
    }
  }

  @AllowAnonymous()
  @Get("/verify-email")
  async verifyEmailPage(
    @Query() query: VerifyEmailQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const viewer = await this.sessionViewService.getViewer(req, res);
    if (viewer) {
      res.redirect(viewer.accountHref);
      return;
    }

    const email = normalizeText(query.email);
    const code = normalizeText(query.code);
    if (email && code) {
      const verified = await this.accountAccessService.verifyEmail(email, code);
      res.redirect(verified ? "/login?verified=1" : `/verify-email?email=${encodeURIComponent(email)}&error=1`);
      return;
    }

    return view("verify-email", {
      titleKey: "auth.verifyEmail.metaTitle",
      viewer: null,
      email,
      code: "",
      hasError: query.error === "1",
      errorMessageKey: query.error === "1" ? "auth.verifyEmail.invalidCode" : undefined,
      infoMessageKey: query.sent === "1" ? "auth.verifyEmail.sent" : undefined,
    });
  }

  @AllowAnonymous()
  @Post("/verify-email")
  async verifyEmail(@Body() body: VerifyEmailBodyDto, @Res() res: Response): Promise<ReturnType<typeof view> | void> {
    const email = normalizeText(body.email);
    const code = normalizeText(body.code);

    if (!email || !code) {
      return view(
        "verify-email",
        {
          titleKey: "auth.verifyEmail.metaTitle",
          viewer: null,
          email,
          code,
          hasError: true,
          errorMessageKey: "auth.verifyEmail.required",
        },
        400
      );
    }

    const verified = await this.accountAccessService.verifyEmail(email, code);
    if (!verified) {
      return view(
        "verify-email",
        {
          titleKey: "auth.verifyEmail.metaTitle",
          viewer: null,
          email,
          code,
          hasError: true,
          errorMessageKey: "auth.verifyEmail.invalidCode",
        },
        400
      );
    }

    res.redirect("/login?verified=1");
  }

  @AllowAnonymous()
  @Post("/verify-email/resend")
  async resendVerifyEmail(@Body() body: ResendVerifyEmailBodyDto): Promise<ReturnType<typeof view>> {
    const email = normalizeText(body.email);
    await this.accountAccessService.resendEmailVerification(email);

    return view("verify-email", {
      titleKey: "auth.verifyEmail.metaTitle",
      viewer: null,
      email,
      code: "",
      hasError: false,
      errorMessage: null,
      infoMessageKey: email ? "auth.verifyEmail.resent" : undefined,
    });
  }

  @AllowAnonymous()
  @Get("/login/verify")
  async verifyLoginPage(
    @Query() query: VerifyLoginPageQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const challengeToken = readLoginChallengeToken(req);
    const challenge = challengeToken ? this.tokenService.verifyLoginChallenge(challengeToken) : null;
    if (!challenge) {
      res.clearCookie(LOGIN_CHALLENGE_COOKIE_NAME, buildCookieOptions(req));
      res.redirect("/login?expired=1");
      return;
    }

    return view("login-two-factor", {
      titleKey: "auth.twoFactor.metaTitle",
      viewer: null,
      email: challenge.email,
      hasError: query.error === "1",
      errorMessageKey: query.error === "1" ? "auth.twoFactor.invalidCode" : undefined,
      infoMessageKey: query.resent === "1" ? "auth.twoFactor.resent" : undefined,
    });
  }

  @AllowAnonymous()
  @Post("/login/verify")
  async verifyLogin(@Body() body: VerifyLoginBodyDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const challengeToken = readLoginChallengeToken(req);
    const challenge = challengeToken ? this.tokenService.verifyLoginChallenge(challengeToken) : null;
    if (!challenge) {
      res.clearCookie(LOGIN_CHALLENGE_COOKIE_NAME, buildCookieOptions(req));
      res.redirect("/login?expired=1");
      return;
    }

    const code = normalizeText(body.code);
    const principal = await this.accountAccessService.completeLogin(
      challenge.userId,
      code,
      resolveRequestAccessLocation(req)
    );
    if (!principal) {
      res.redirect("/login/verify?error=1");
      return;
    }

    const token = this.tokenService.issue(principal);
    res.clearCookie(LOGIN_CHALLENGE_COOKIE_NAME, buildCookieOptions(req));
    res.cookie(SESSION_COOKIE_NAME, token, {
      ...buildCookieOptions(req),
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.redirect(challenge.redirectTo);
  }

  @AllowAnonymous()
  @Post("/login/verify/resend")
  async resendLoginCode(req: Request, res: Response): Promise<void> {
    const challengeToken = readLoginChallengeToken(req);
    const challenge = challengeToken ? this.tokenService.verifyLoginChallenge(challengeToken) : null;
    if (!challenge) {
      res.clearCookie(LOGIN_CHALLENGE_COOKIE_NAME, buildCookieOptions(req));
      res.redirect("/login?expired=1");
      return;
    }

    const result = await this.accountAccessService.resendLoginTwoFactor(challenge.userId);
    if (!result) {
      res.clearCookie(LOGIN_CHALLENGE_COOKIE_NAME, buildCookieOptions(req));
      res.redirect("/login?expired=1");
      return;
    }

    res.redirect("/login/verify?resent=1");
  }

  @AllowAnonymous()
  @Get("/forgot-password")
  async forgotPasswordPage(@Req() req: Request, @Res() res: Response): Promise<ReturnType<typeof view> | void> {
    const viewer = await this.sessionViewService.getViewer(req, res);
    if (viewer) {
      res.redirect(viewer.accountHref);
      return;
    }

    return view("forgot-password", {
      titleKey: "auth.forgotPassword.metaTitle",
      viewer: null,
      email: "",
      hasError: false,
      infoMessage: undefined,
    });
  }

  @AllowAnonymous()
  @Post("/forgot-password")
  async forgotPassword(@Body() body: ForgotPasswordBodyDto): Promise<ReturnType<typeof view>> {
    const email = normalizeText(body.email);
    if (!email) {
      return view(
        "forgot-password",
        {
          titleKey: "auth.forgotPassword.metaTitle",
          viewer: null,
          email,
          hasError: true,
          errorMessageKey: "auth.forgotPassword.emailRequired",
        },
        400
      );
    }

    await this.accountAccessService.requestPasswordReset(email);
    return view("forgot-password", {
      titleKey: "auth.forgotPassword.metaTitle",
      viewer: null,
      email,
      hasError: false,
      infoMessageKey: "auth.forgotPassword.sent",
    });
  }

  @AllowAnonymous()
  @Get("/reset-password")
  async resetPasswordPage(
    @Query() query: ResetPasswordQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const viewer = await this.sessionViewService.getViewer(req, res);
    if (viewer) {
      res.redirect(viewer.accountHref);
      return;
    }

    return view("reset-password", {
      titleKey: "auth.resetPassword.metaTitle",
      viewer: null,
      email: normalizeText(query.email),
      code: normalizeText(query.code),
      hasError: query.error === "1",
      errorMessageKey: query.error === "1" ? "auth.resetPassword.invalidCode" : undefined,
    });
  }

  @AllowAnonymous()
  @Post("/reset-password")
  async resetPassword(@Body() body: ResetPasswordBodyDto, @Res() res: Response): Promise<ReturnType<typeof view> | void> {
    const email = normalizeText(body.email);
    const code = normalizeText(body.code);
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    if (!email || !code || !password || !confirmPassword) {
      return view(
        "reset-password",
        {
          titleKey: "auth.resetPassword.metaTitle",
          viewer: null,
          email,
          code,
          hasError: true,
          errorMessageKey: "auth.resetPassword.allFieldsRequired",
        },
        400
      );
    }

    if (password.length < 8) {
      return view(
        "reset-password",
        {
          titleKey: "auth.resetPassword.metaTitle",
          viewer: null,
          email,
          code,
          hasError: true,
          errorMessageKey: "auth.resetPassword.passwordLength",
        },
        400
      );
    }

    if (password !== confirmPassword) {
      return view(
        "reset-password",
        {
          titleKey: "auth.resetPassword.metaTitle",
          viewer: null,
          email,
          code,
          hasError: true,
          errorMessageKey: "auth.resetPassword.passwordMismatch",
        },
        400
      );
    }

    const reset = await this.accountAccessService.resetPassword(email, code, password);
    if (!reset) {
      return view(
        "reset-password",
        {
          titleKey: "auth.resetPassword.metaTitle",
          viewer: null,
          email,
          code,
          hasError: true,
          errorMessageKey: "auth.resetPassword.invalidCode",
        },
        400
      );
    }

    res.redirect("/login?reset=1");
  }

  @AllowAnonymous()
  @Post("/logout")
  logout(@Req() req: Request, @Res() res: Response): void {
    res.clearCookie(LOGIN_CHALLENGE_COOKIE_NAME, buildCookieOptions(req));
    res.clearCookie(SESSION_COOKIE_NAME, buildCookieOptions(req));
    res.redirect("/");
  }

  @Authenticated("app-session")
  @Get("/dashboard")
  async dashboard(
    @Query() query: DashboardQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const viewer = await this.sessionViewService.getViewer(req, res);
    const authenticatedRequest = req as AuthenticatedRequest;
    const userId = Number(authenticatedRequest.user?.id || authenticatedRequest.auth?.user?.id || 0);
    const user = Number.isFinite(userId) ? await this.userService.getById(userId) : null;

    if (!user || !viewer) {
      res.redirect("/login");
      return;
    }

    return view("dashboard", {
      titleKey: "auth.dashboard.metaTitle",
      viewer,
      user: {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        receiveNewsUpdates: user.receiveNewsUpdates,
        newsletterSubscribed: user.newsletterSubscribed,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      preferencesUpdated: query.preferences === "updated",
    });
  }

  @Authenticated("app-session")
  @Post("/dashboard/newsletter")
  async updateDashboardNewsletter(
    @Body() body: DashboardNewsletterBodyDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const userId = Number(authenticatedRequest.user?.id || authenticatedRequest.auth?.user?.id || 0);

    if (!Number.isFinite(userId) || userId <= 0) {
      res.redirect("/login");
      return;
    }

    await this.userService.updateNewsletterSubscription(userId, parseCheckboxValue(body.newsletterSubscribed));
    res.redirect("/dashboard?preferences=updated");
  }
}
