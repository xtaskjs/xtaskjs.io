import { join } from "path";
import {
  createMailtrapTransportOptions,
  registerHandlebarsTemplateRenderer,
  registerMailerTemplate,
  registerMailerTransport,
} from "@xtaskjs/mailer";
import { AppConfig } from "../../../shared/infrastructure/config/app-config";

type GlobalMailerState = typeof globalThis & {
  __xtaskjsAuthMailerRegistered?: boolean;
};

const globalMailerState = globalThis as GlobalMailerState;

const resolveTransport = () => {
  if (AppConfig.mail.mailtrapUser && AppConfig.mail.mailtrapPassword) {
    return createMailtrapTransportOptions({
      username: AppConfig.mail.mailtrapUser,
      password: AppConfig.mail.mailtrapPassword,
      host: AppConfig.mail.mailtrapHost,
      port: AppConfig.mail.mailtrapPort,
      secure: AppConfig.mail.mailtrapSecure,
    });
  }

  return {
    jsonTransport: true,
  };
};

export const registerAuthMailer = (): void => {
  if (globalMailerState.__xtaskjsAuthMailerRegistered) {
    return;
  }

  registerMailerTransport({
    name: "default",
    defaults: {
      from: AppConfig.mail.defaultFrom,
    },
    transport: resolveTransport(),
    verifyOnStart: false,
  });

  registerMailerTransport({
    name: "notifications",
    defaults: {
      from: AppConfig.mail.notificationsFrom,
    },
    transport: {
      jsonTransport: true,
    },
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