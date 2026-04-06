import "dotenv/config";
import path from "path";
import {
  resolveMailTransportProvider,
  type MailTransportAccountConfig,
  type MailTransportProvider,
} from "./mail-transport-config";

export type AppConfiguration = {
  readonly host: string;
  readonly port: number;
  readonly publicUrl: string;
  readonly nodeEnv: string;
  readonly isProduction: boolean;
  readonly ssl: {
    readonly enabled: boolean;
    readonly keyPath?: string;
    readonly certPath?: string;
    readonly caPath?: string;
  };
  readonly cache: {
    readonly namespace: string;
    readonly connectOnStart: boolean;
    readonly redisUrl: string;
    readonly documentationTtl: string;
    readonly queryTtl: string;
    readonly documentationHttpMaxAge: string;
  };
  readonly admin: {
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly passwordHash?: string;
  };
  readonly security: {
    readonly jwtSecret: string;
    readonly issuer: string;
  };
  readonly mail: {
    readonly defaultFrom: string;
    readonly notificationsFrom: string;
    readonly supportEmail: string;
    readonly notificationsTo: string;
    readonly transportProvider: MailTransportProvider;
    readonly notificationsTransportProvider: MailTransportProvider;
    readonly mailtrap: MailTransportAccountConfig;
    readonly smtp: MailTransportAccountConfig;
  };
  readonly database: {
    readonly write: {
      readonly type: "postgres";
      readonly host: string;
      readonly port: number;
      readonly username: string;
      readonly password: string;
      readonly database: string;
      readonly synchronize: boolean;
      readonly logging: boolean;
    };
    readonly read: {
      readonly type: "postgres";
      readonly host: string;
      readonly port: number;
      readonly username: string;
      readonly password: string;
      readonly database: string;
      readonly synchronize: boolean;
      readonly logging: boolean;
    };
  };
  readonly paths: {
    readonly root: string;
    readonly public: string;
    readonly uploads: string;
    readonly views: string;
  };
};

const root = process.cwd();
const trimOptionalEnv = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const sslKeyPath = trimOptionalEnv(process.env.SSL_KEY_PATH);
const sslCertPath = trimOptionalEnv(process.env.SSL_CERT_PATH);
const sslCaPath = trimOptionalEnv(process.env.SSL_CA_PATH);
const trimEnvWithFallback = (value: string | undefined, fallback: string): string =>
  trimOptionalEnv(value) || fallback;
const parseOptionalNumberEnv = (value: string | undefined): number | undefined => {
  const normalized = trimOptionalEnv(value);

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const parseBooleanEnv = (value: string | undefined, fallback = false): boolean => {
  const normalized = trimOptionalEnv(value)?.toLowerCase();

  if (!normalized) {
    return fallback;
  }

  return normalized === "true";
};

const mailtrapAccount: MailTransportAccountConfig = {
  username: trimOptionalEnv(process.env.MAILTRAP_SMTP_USER),
  password: trimOptionalEnv(process.env.MAILTRAP_SMTP_PASS),
  host: trimOptionalEnv(process.env.MAILTRAP_SMTP_HOST),
  port: parseOptionalNumberEnv(process.env.MAILTRAP_SMTP_PORT),
  secure: parseBooleanEnv(process.env.MAILTRAP_SMTP_SECURE),
};

const smtpAccount: MailTransportAccountConfig = {
  username: trimOptionalEnv(process.env.MAIL_SMTP_USER),
  password: trimOptionalEnv(process.env.MAIL_SMTP_PASS),
  host: trimOptionalEnv(process.env.MAIL_SMTP_HOST),
  port: parseOptionalNumberEnv(process.env.MAIL_SMTP_PORT),
  secure: parseBooleanEnv(process.env.MAIL_SMTP_SECURE),
};

const mailTransportProvider = resolveMailTransportProvider(
  trimOptionalEnv(process.env.MAIL_TRANSPORT_PROVIDER),
  {
    mailtrap: mailtrapAccount,
    smtp: smtpAccount,
  },
);

const notificationsMailTransportProvider = resolveMailTransportProvider(
  trimOptionalEnv(process.env.MAIL_NOTIFICATIONS_TRANSPORT_PROVIDER) || "json",
  {
    mailtrap: mailtrapAccount,
    smtp: smtpAccount,
  },
);

const adminUsername = trimEnvWithFallback(process.env.ADMIN_USERNAME, "admin");
const adminEmail =
  trimOptionalEnv(process.env.ADMIN_EMAIL) ||
  trimOptionalEnv(process.env.MAIL_SMTP_USER) ||
  `${adminUsername.trim().toLowerCase()}@xtaskjs.local`;

export const AppConfig: AppConfiguration = {
  host: process.env.HOST || "0.0.0.0",
  port: Number(process.env.PORT || 3000),
  publicUrl: trimEnvWithFallback(process.env.PUBLIC_URL, `http://127.0.0.1:${Number(process.env.PORT || 3000)}`),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  ssl: {
    enabled: process.env.SSL_ENABLED === "true",
    keyPath: sslKeyPath,
    certPath: sslCertPath,
    caPath: sslCaPath,
  },
  cache: {
    namespace: process.env.CACHE_NAMESPACE || "xtaskjs.io",
    connectOnStart: process.env.CACHE_CONNECT_ON_START !== "false",
    redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    documentationTtl: process.env.DOCS_CACHE_TTL || "15m",
    queryTtl: process.env.QUERY_CACHE_TTL || "2m",
    documentationHttpMaxAge: process.env.DOCS_HTTP_CACHE_MAX_AGE || "5m",
  },
  admin: {
    username: adminUsername,
    email: adminEmail,
    password: process.env.ADMIN_PASSWORD || "admin123!",
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
  },
  security: {
    jwtSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "xtaskjs-dev-secret",
    issuer: process.env.JWT_ISSUER || "xtaskjs.io",
  },
  mail: {
    defaultFrom: trimEnvWithFallback(process.env.MAIL_FROM, "hello@xtaskjs.dev"),
    notificationsFrom: trimEnvWithFallback(process.env.MAIL_NOTIFICATIONS_FROM, "alerts@xtaskjs.dev"),
    supportEmail: trimEnvWithFallback(process.env.MAIL_SUPPORT_TO, "support@xtaskjs.dev"),
    notificationsTo: trimEnvWithFallback(process.env.MAIL_NOTIFICATIONS_TO, "ops@xtaskjs.dev"),
    transportProvider: mailTransportProvider,
    notificationsTransportProvider: notificationsMailTransportProvider,
    mailtrap: mailtrapAccount,
    smtp: smtpAccount,
  },
  database: {
    write: {
      type: "postgres",
      host: process.env.POSTGRES_HOST || "localhost",
      port: Number(process.env.POSTGRES_PORT || 5432),
      username: process.env.POSTGRES_USER || "xtask",
      password: process.env.POSTGRES_PASSWORD || "xtask",
      database: process.env.POSTGRES_DB || "xtaskjs",
      synchronize: false,
      logging: false,
    },
    read: {
      type: "postgres",
      host: process.env.READ_POSTGRES_HOST || process.env.POSTGRES_HOST || "localhost",
      port: Number(process.env.READ_POSTGRES_PORT || process.env.POSTGRES_PORT || 5432),
      username: process.env.READ_POSTGRES_USER || process.env.POSTGRES_USER || "xtask",
      password: process.env.READ_POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD || "xtask",
      database: process.env.READ_POSTGRES_DB || process.env.POSTGRES_DB || "xtaskjs",
      synchronize: false,
      logging: false,
    },
  },
  paths: {
    root,
    public: path.join(root, "public"),
    uploads: path.join(root, "public", "uploads"),
    views: path.join(root, "views"),
  },
};
