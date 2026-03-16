import { Service } from "@xtaskjs/core";
import { InjectMailerService, MailerService } from "@xtaskjs/mailer";
import { AppConfig } from "../../shared/infrastructure/config/app-config";
import type { User } from "../../users/domain/user";

const previewFrom = (result: any): string | undefined => {
  const message = result?.message;
  return typeof message === "string"
    ? message
    : Buffer.isBuffer(message)
      ? message.toString("utf-8")
      : undefined;
};

const formatExpiry = (value: Date): string =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(value);

@Service()
export class AuthMailerService {
  @InjectMailerService()
  private readonly mailer!: MailerService;

  private readonly config = AppConfig;

  async sendEmailVerification(user: User, code: string, expiresAt: Date): Promise<void> {
    const result = await this.mailer.sendTemplate(
      "auth-email-verification",
      {
        user,
        code,
        expiresAtLabel: formatExpiry(expiresAt),
        actionUrl: `${this.config.publicUrl}/verify-email?email=${encodeURIComponent(user.email)}&code=${encodeURIComponent(code)}`,
        supportEmail: this.config.mail.supportEmail,
      },
      {
        message: { to: user.email },
      }
    );

    const preview = previewFrom(result);
    if (preview) {
      console.info(`[auth-mailer] verification email preview for ${user.email}: ${preview}`);
    }
  }

  async sendLoginTwoFactorCode(user: User, code: string, expiresAt: Date): Promise<void> {
    const result = await this.mailer.sendTemplate(
      "auth-login-two-factor",
      {
        user,
        code,
        expiresAtLabel: formatExpiry(expiresAt),
        actionUrl: `${this.config.publicUrl}/login/verify`,
        supportEmail: this.config.mail.supportEmail,
      },
      {
        message: { to: user.email },
      }
    );

    const preview = previewFrom(result);
    if (preview) {
      console.info(`[auth-mailer] two-factor email preview for ${user.email}: ${preview}`);
    }
  }

  async sendPasswordResetCode(user: User, code: string, expiresAt: Date): Promise<void> {
    const result = await this.mailer.sendTemplate(
      "auth-password-reset",
      {
        user,
        code,
        expiresAtLabel: formatExpiry(expiresAt),
        actionUrl: `${this.config.publicUrl}/reset-password?email=${encodeURIComponent(user.email)}&code=${encodeURIComponent(code)}`,
        supportEmail: this.config.mail.supportEmail,
      },
      {
        message: { to: user.email },
      }
    );

    const preview = previewFrom(result);
    if (preview) {
      console.info(`[auth-mailer] password reset email preview for ${user.email}: ${preview}`);
    }
  }
}