import {
  createMailtrapTransportOptions,
  type MailerTransportInput,
} from "@xtaskjs/mailer";

export type MailTransportProvider = "json" | "mailtrap" | "smtp";

export type MailTransportAccountConfig = {
  readonly username?: string;
  readonly password?: string;
  readonly host?: string;
  readonly port?: number;
  readonly secure: boolean;
};

export type MailTransportAccounts = {
  readonly mailtrap: MailTransportAccountConfig;
  readonly smtp: MailTransportAccountConfig;
};

export type MailTransportConfiguration = MailTransportAccounts & {
  readonly provider: MailTransportProvider;
};

const supportedProviders = new Set<MailTransportProvider>(["json", "mailtrap", "smtp"]);

const hasCredentials = (account: MailTransportAccountConfig): boolean =>
  Boolean(account.username && account.password);

export const inferMailTransportProvider = (accounts: MailTransportAccounts): MailTransportProvider => {
  if (hasCredentials(accounts.mailtrap)) {
    return "mailtrap";
  }

  if (hasCredentials(accounts.smtp)) {
    return "smtp";
  }

  return "json";
};

export const resolveMailTransportProvider = (
  requestedProvider: string | undefined,
  accounts: MailTransportAccounts,
): MailTransportProvider => {
  const normalizedProvider = requestedProvider?.trim().toLowerCase();

  if (!normalizedProvider) {
    return inferMailTransportProvider(accounts);
  }

  if (!supportedProviders.has(normalizedProvider as MailTransportProvider)) {
    return inferMailTransportProvider(accounts);
  }

  if (normalizedProvider === "json") {
    return "json";
  }

  if (normalizedProvider === "mailtrap") {
    return hasCredentials(accounts.mailtrap) ? "mailtrap" : "json";
  }

  return hasCredentials(accounts.smtp) ? "smtp" : "json";
};

export const createMailTransport = (
  configuration: MailTransportConfiguration,
): MailerTransportInput => {
  if (configuration.provider === "mailtrap") {
    const { username, password, host, port, secure } = configuration.mailtrap;

    if (!username || !password) {
      return { jsonTransport: true };
    }

    return createMailtrapTransportOptions({
      username,
      password,
      host,
      port,
      secure,
    });
  }

  if (configuration.provider === "smtp") {
    if (!hasCredentials(configuration.smtp)) {
      return { jsonTransport: true };
    }

    return {
      ...(configuration.smtp.host ? { host: configuration.smtp.host } : {}),
      ...(configuration.smtp.port ? { port: configuration.smtp.port } : {}),
      secure: configuration.smtp.secure,
      auth: {
        user: configuration.smtp.username,
        pass: configuration.smtp.password,
      },
    };
  }

  return { jsonTransport: true };
};