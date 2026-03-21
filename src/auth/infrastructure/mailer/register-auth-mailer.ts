import { join } from "path";
import {
  registerHandlebarsTemplateRenderer,
  registerMailerTemplate,
  registerMailerTransport,
} from "@xtaskjs/mailer";
import { AppConfig } from "../../../shared/infrastructure/config/app-config";
import { createMailTransport } from "../../../shared/infrastructure/config/mail-transport-config";

type GlobalMailerState = typeof globalThis & {
  __xtaskjsAuthMailerRegistered?: boolean;
};

const globalMailerState = globalThis as GlobalMailerState;

const warnIfSmtpTlsModeLooksWrong = (
  provider: string,
  smtp: typeof AppConfig.mail.smtp,
  transportLabel: string,
): void => {
  if (provider !== "smtp") {
    return;
  }

  if (smtp.port === 465 && !smtp.secure) {
    console.warn(
      `[auth-mailer] ${transportLabel} uses SMTP on port 465 but MAIL_SMTP_SECURE is false. Port 465 expects implicit TLS, so secure should be true.`,
    );
  }

  if (smtp.port === 587 && smtp.secure) {
    console.warn(
      `[auth-mailer] ${transportLabel} uses SMTP on port 587 but MAIL_SMTP_SECURE is true. Port 587 expects STARTTLS, so secure should usually be false.`,
    );
  }
};

const warnIfMailConfigurationLooksWrong = (): void => {
  const { defaultFrom, notificationsFrom, transportProvider, notificationsTransportProvider, smtp } = AppConfig.mail;
  const adminEmail = AppConfig.admin.email.trim().toLowerCase();

  if (transportProvider === "json" && (smtp.username || smtp.password || smtp.host || smtp.port)) {
    console.warn(
      "[auth-mailer] MAIL_TRANSPORT_PROVIDER is set to json, so SMTP settings are being ignored and emails will only be generated as previews.",
    );
  }

  if (notificationsTransportProvider === "json" && (smtp.username || smtp.password || smtp.host || smtp.port)) {
    console.warn(
      "[auth-mailer] MAIL_NOTIFICATIONS_TRANSPORT_PROVIDER is set to json, so notification emails will not use SMTP.",
    );
  }

  warnIfSmtpTlsModeLooksWrong(transportProvider, smtp, "Default transport");
  warnIfSmtpTlsModeLooksWrong(notificationsTransportProvider, smtp, "Notification transport");

  if (transportProvider === "smtp" && !smtp.host) {
    console.warn("[auth-mailer] MAIL_TRANSPORT_PROVIDER is smtp but MAIL_SMTP_HOST is not configured.");
  }

  if (transportProvider === "smtp" && (!smtp.username || !smtp.password)) {
    console.warn(
      "[auth-mailer] MAIL_TRANSPORT_PROVIDER is smtp but SMTP credentials are incomplete. The transport will fall back to JSON previews.",
    );
  }

  if (transportProvider === "smtp" && defaultFrom !== smtp.username) {
    console.warn(
      `[auth-mailer] MAIL_FROM is ${defaultFrom} while SMTP authenticates as ${smtp.username}. Some providers reject sender addresses that do not match the authenticated mailbox or an allowed alias.`,
    );
  }

  if (notificationsTransportProvider === "smtp" && notificationsFrom !== smtp.username) {
    console.warn(
      `[auth-mailer] MAIL_NOTIFICATIONS_FROM is ${notificationsFrom} while SMTP authenticates as ${smtp.username}. Some providers reject sender addresses that do not match the authenticated mailbox or an allowed alias.`,
    );
  }

  if ((transportProvider === "smtp" || notificationsTransportProvider === "smtp") && adminEmail.endsWith(".local")) {
    console.warn(
      `[auth-mailer] ADMIN_EMAIL resolves to ${adminEmail}. Local-only domains are not routable and will cause login verification emails to be rejected by external SMTP providers.`,
    );
  }
};

export const registerAuthMailer = (): void => {
  if (globalMailerState.__xtaskjsAuthMailerRegistered) {
    return;
  }

  warnIfMailConfigurationLooksWrong();

  registerMailerTransport({
    name: "default",
    defaults: {
      from: AppConfig.mail.defaultFrom,
    },
    transport: createMailTransport({
      provider: AppConfig.mail.transportProvider,
      mailtrap: AppConfig.mail.mailtrap,
      smtp: AppConfig.mail.smtp,
    }),
    verifyOnStart: false,
  });

  registerMailerTransport({
    name: "notifications",
    defaults: {
      from: AppConfig.mail.notificationsFrom,
    },
    transport: createMailTransport({
      provider: AppConfig.mail.notificationsTransportProvider,
      mailtrap: AppConfig.mail.mailtrap,
      smtp: AppConfig.mail.smtp,
    }),
    verifyOnStart: false,
  });

  registerHandlebarsTemplateRenderer({
    name: "auth-hbs",
    viewsDir: join(process.cwd(), "views", "mail"),
  });

  registerMailerTemplate({
    name: "auth-email-verification",
    renderer: "auth-hbs",
    subject: "auth-email-verification.subject",
    text: "auth-email-verification.text",
    html: "auth-email-verification.html",
  });

  registerMailerTemplate({
    name: "auth-login-two-factor",
    renderer: "auth-hbs",
    subject: "auth-login-two-factor.subject",
    text: "auth-login-two-factor.text",
    html: "auth-login-two-factor.html",
  });

  registerMailerTemplate({
    name: "auth-password-reset",
    renderer: "auth-hbs",
    subject: "auth-password-reset.subject",
    text: "auth-password-reset.text",
    html: "auth-password-reset.html",
  });

  globalMailerState.__xtaskjsAuthMailerRegistered = true;
};