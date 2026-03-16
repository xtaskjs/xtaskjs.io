import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { AutoWired, Service } from "@xtaskjs/core";
import { AuthMailerService } from "./auth-mailer.service";
import type { AccessLocationSnapshot } from "../../users/domain/access-location";
import { UserService, type PendingSecurityCode, type RegisterUserCommand, type SessionPrincipal } from "../../users/application/user.service";

type LoginStartResult =
  | { readonly status: "invalid" }
  | { readonly status: "verification-required"; readonly email: string }
  | {
      readonly status: "two-factor-required";
      readonly principal: SessionPrincipal;
      readonly email: string;
      readonly expiresAt: Date;
    };

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const TWO_FACTOR_TTL_MS = 1000 * 60 * 10;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

const nowPlus = (ttlMs: number): Date => new Date(Date.now() + ttlMs);
const isExpired = (value: Date | null): boolean => !value || value.getTime() < Date.now();
const createCode = (): string => String(randomInt(100000, 1000000));

@Service()
export class AccountAccessService {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  @AutoWired({ qualifier: AuthMailerService.name })
  private readonly authMailer!: AuthMailerService;

  async register(
    command: RegisterUserCommand,
    accessLocation?: AccessLocationSnapshot
  ): Promise<{ email: string; expiresAt: Date }> {
    const verificationCode = await this.createPendingCode(EMAIL_VERIFICATION_TTL_MS);
    const user = await this.userService.register(command, verificationCode, accessLocation);
    await this.authMailer.sendEmailVerification(user, verificationCode.plain, verificationCode.expiresAt);
    return {
      email: user.email,
      expiresAt: verificationCode.expiresAt,
    };
  }

  async resendEmailVerification(email: string): Promise<boolean> {
    const user = await this.userService.getByEmail(email);
    if (!user || user.emailVerified || !user.isActive) {
      return false;
    }

    const verificationCode = await this.createPendingCode(EMAIL_VERIFICATION_TTL_MS);
    const updated = await this.userService.storeEmailVerificationCode(user.id, verificationCode);
    await this.authMailer.sendEmailVerification(updated, verificationCode.plain, verificationCode.expiresAt);
    return true;
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const user = await this.userService.getByEmail(email);
    if (!user || !user.isActive) {
      return false;
    }

    if (user.emailVerified) {
      return true;
    }

    if (!user.emailVerificationCodeHash || isExpired(user.emailVerificationExpiresAt)) {
      return false;
    }

    const matches = await bcrypt.compare(code, user.emailVerificationCodeHash);
    if (!matches) {
      return false;
    }

    await this.userService.markEmailVerified(user.id);
    return true;
  }

  async beginLogin(identifier: string, password: string, requiredRole?: string): Promise<LoginStartResult> {
    const user = await this.userService.validateCredentials(identifier, password);
    if (!user) {
      return { status: "invalid" };
    }

    if (!user.emailVerified) {
      await this.resendEmailVerification(user.email);
      return {
        status: "verification-required",
        email: user.email,
      };
    }

    const twoFactorCode = await this.createPendingCode(TWO_FACTOR_TTL_MS);
    const updated = await this.userService.storeTwoFactorCode(user.id, twoFactorCode);
    await this.authMailer.sendLoginTwoFactorCode(updated, twoFactorCode.plain, twoFactorCode.expiresAt);

    const principal = await this.userService.resolvePrincipalById(user.id);
    if (!principal) {
      return { status: "invalid" };
    }

    if (requiredRole && !principal.roles.includes(requiredRole)) {
      await this.userService.clearTwoFactorCode(user.id);
      return { status: "invalid" };
    }

    return {
      status: "two-factor-required",
      principal,
      email: updated.email,
      expiresAt: twoFactorCode.expiresAt,
    };
  }

  async resendLoginTwoFactor(userId: number): Promise<{ email: string; expiresAt: Date } | null> {
    const user = await this.userService.getById(userId);
    if (!user || !user.isActive || !user.emailVerified) {
      return null;
    }

    const twoFactorCode = await this.createPendingCode(TWO_FACTOR_TTL_MS);
    const updated = await this.userService.storeTwoFactorCode(user.id, twoFactorCode);
    await this.authMailer.sendLoginTwoFactorCode(updated, twoFactorCode.plain, twoFactorCode.expiresAt);

    return {
      email: updated.email,
      expiresAt: twoFactorCode.expiresAt,
    };
  }

  async completeLogin(
    userId: number,
    code: string,
    accessLocation?: AccessLocationSnapshot
  ): Promise<SessionPrincipal | null> {
    const user = await this.userService.getById(userId);
    if (!user || !user.isActive || !user.twoFactorCodeHash || isExpired(user.twoFactorExpiresAt)) {
      return null;
    }

    const matches = await bcrypt.compare(code, user.twoFactorCodeHash);
    if (!matches) {
      return null;
    }

    await this.userService.clearTwoFactorCode(user.id);
    if (accessLocation) {
      await this.userService.recordLoginEvent(user.id, accessLocation);
    }
    return this.userService.resolvePrincipalById(user.id);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    if (!user || !user.isActive) {
      return;
    }

    const resetCode = await this.createPendingCode(PASSWORD_RESET_TTL_MS);
    const updated = await this.userService.storePasswordResetCode(user.id, resetCode);
    await this.authMailer.sendPasswordResetCode(updated, resetCode.plain, resetCode.expiresAt);
  }

  async resetPassword(email: string, code: string, password: string): Promise<boolean> {
    const user = await this.userService.getByEmail(email);
    if (!user || !user.isActive || !user.passwordResetCodeHash || isExpired(user.passwordResetExpiresAt)) {
      return false;
    }

    const matches = await bcrypt.compare(code, user.passwordResetCodeHash);
    if (!matches) {
      return false;
    }

    await this.userService.setPassword(user.id, password);
    return true;
  }

  private async createPendingCode(ttlMs: number): Promise<PendingSecurityCode & { plain: string }> {
    const plain = createCode();
    return {
      plain,
      hash: await bcrypt.hash(plain, 10),
      expiresAt: nowPlus(ttlMs),
    };
  }
}