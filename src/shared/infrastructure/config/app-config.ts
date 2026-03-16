import "dotenv/config";
import path from "path";

export type AppConfiguration = {
  readonly host: string;
  readonly port: number;
  readonly publicUrl: string;
  readonly nodeEnv: string;
  readonly isProduction: boolean;
  readonly admin: {
    readonly username: string;
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
    readonly mailtrapUser?: string;
    readonly mailtrapPassword?: string;
    readonly mailtrapHost?: string;
    readonly mailtrapPort?: number;
    readonly mailtrapSecure: boolean;
  };
  readonly database: {
    readonly type: "postgres";
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly password: string;
    readonly database: string;
    readonly synchronize: boolean;
    readonly logging: boolean;
  };
  readonly paths: {
    readonly root: string;
    readonly public: string;
    readonly uploads: string;
    readonly views: string;
  };
};

const root = process.cwd();

export const AppConfig: AppConfiguration = {
  host: process.env.HOST || "0.0.0.0",
  port: Number(process.env.PORT || 3000),
  publicUrl: process.env.PUBLIC_URL || `http://127.0.0.1:${Number(process.env.PORT || 3000)}`,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123!",
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
  },
  security: {
    jwtSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "xtaskjs-dev-secret",
    issuer: process.env.JWT_ISSUER || "xtaskjs.io",
  },
  mail: {
    defaultFrom: process.env.MAIL_FROM || "hello@xtaskjs.dev",
    notificationsFrom: process.env.MAIL_NOTIFICATIONS_FROM || "alerts@xtaskjs.dev",
    supportEmail: process.env.MAIL_SUPPORT_TO || "support@xtaskjs.dev",
    notificationsTo: process.env.MAIL_NOTIFICATIONS_TO || "ops@xtaskjs.dev",
    mailtrapUser: process.env.MAILTRAP_SMTP_USER,
    mailtrapPassword: process.env.MAILTRAP_SMTP_PASS,
    mailtrapHost: process.env.MAILTRAP_SMTP_HOST,
    mailtrapPort: process.env.MAILTRAP_SMTP_PORT ? Number(process.env.MAILTRAP_SMTP_PORT) : undefined,
    mailtrapSecure: process.env.MAILTRAP_SMTP_SECURE === "true",
  },
  database: {
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER || "xtask",
    password: process.env.POSTGRES_PASSWORD || "xtask",
    database: process.env.POSTGRES_DB || "xtaskjs",
    synchronize: false,
    logging: false,
  },
  paths: {
    root,
    public: path.join(root, "public"),
    uploads: path.join(root, "public", "uploads"),
    views: path.join(root, "views"),
  },
};
