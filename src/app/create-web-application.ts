import express from "express";
import path from "path";
import { mkdir } from "fs/promises";
import { readFileSync } from "fs";
import { createServer as createHttpsServer, type Server as HttpsServer } from "https";
import bcrypt from "bcryptjs";
import { engine as hbsEngine } from "express-handlebars";
import { CreateApplication, type XTaskHttpApplication } from "@xtaskjs/core";
import { configureCache } from "@xtaskjs/cache";
import { ExpressAdapter } from "@xtaskjs/express-http";
import { AppConfig } from "../shared/infrastructure/config/app-config";
import { handlebarsHelpers } from "../shared/infrastructure/http/handlebars-helpers";
import { attachHtmlValidationErrorHandler } from "../shared/infrastructure/http/html-validation-error-handler";
import { attachInternationalizationRequestState } from "../shared/infrastructure/http/internationalization-request.middleware";
import { createMulterUpload } from "../shared/infrastructure/http/multer.factory";
import { getAppDataSource } from "../data-source";
import "../auth/infrastructure/security/admin-jwt-security.strategy";
import { registerAuthMailer } from "../auth/infrastructure/mailer/register-auth-mailer";
import "../shared/infrastructure/internationalization/site.internationalization";

const normalizeIdentity = (value: string): string => value.trim().toLowerCase();

const resolveAdminPasswordHash = async (): Promise<string> => {
  if (AppConfig.admin.passwordHash) {
    return AppConfig.admin.passwordHash;
  }

  return bcrypt.hash(AppConfig.admin.password, 10);
};

const ensureAdminAccount = async (): Promise<void> => {
  const dataSource = getAppDataSource();
  const users = dataSource.getRepository("User");
  const username = normalizeIdentity(AppConfig.admin.username);
  const email = `${username}@xtaskjs.local`;
  const passwordHash = await resolveAdminPasswordHash();
  const existing = await users.findOne({ where: { username } });

  if (!existing) {
    await users.save(
      users.create({
        fullName: "Administrator",
        username,
        email,
        passwordHash,
        role: "admin",
        isActive: true,
        emailVerified: true,
      })
    );
    return;
  }

  const updates: Record<string, unknown> = {};
  if (existing.role !== "admin") {
    updates.role = "admin";
  }
  if (!existing.isActive) {
    updates.isActive = true;
  }
  if (!existing.emailVerified) {
    updates.emailVerified = true;
  }
  if (existing.passwordHash !== passwordHash) {
    updates.passwordHash = passwordHash;
  }
  if (existing.email !== email) {
    updates.email = email;
  }
  if (existing.fullName !== "Administrator") {
    updates.fullName = "Administrator";
  }

  if (Object.keys(updates).length > 0) {
    await users.update({ id: existing.id }, updates);
  }
};

const bootstrapInfrastructure = async (): Promise<void> => {
  await mkdir(AppConfig.paths.uploads, { recursive: true });

  const dataSource = getAppDataSource();
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  await dataSource.runMigrations();
  await ensureAdminAccount();
};

const configureApplicationCache = (): void => {
  configureCache({
    defaultDriver: "redis",
    defaultTtl: AppConfig.cache.documentationTtl,
    namespace: AppConfig.cache.namespace,
    connectOnStart: AppConfig.cache.connectOnStart,
    httpCacheDefaults: {
      visibility: "private",
      maxAge: AppConfig.cache.documentationHttpMaxAge,
      etag: true,
      vary: ["accept-language", "cookie"],
    },
    redis: {
      url: AppConfig.cache.redisUrl,
      connectOnStart: AppConfig.cache.connectOnStart,
    },
  });
};

type ListenableAdapter = ExpressAdapter & {
  listen: (options: { host: string; port: number }) => Promise<void>;
  close: () => Promise<void>;
};

const resolveHttpsCredentials = (): { key: Buffer; cert: Buffer; ca?: Buffer } => {
  const { keyPath, certPath, caPath } = AppConfig.ssl;

  if (!keyPath) {
    throw new Error("SSL is enabled but SSL_KEY_PATH is not configured");
  }

  if (!certPath) {
    throw new Error("SSL is enabled but SSL_CERT_PATH is not configured");
  }

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
    ca: caPath ? readFileSync(caPath) : undefined,
  };
};

const enableHttpsListener = (adapter: ListenableAdapter, expressApp: express.Express): void => {
  const credentials = resolveHttpsCredentials();
  let httpsServer: HttpsServer | undefined;

  adapter.listen = async ({ host, port }): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      const server = createHttpsServer(credentials, expressApp);
      const cleanupErrorHandler = (): void => {
        server.off("error", onError);
      };
      const onError = (error: Error): void => {
        cleanupErrorHandler();
        reject(error);
      };

      server.once("error", onError);
      server.listen(port, host, () => {
        cleanupErrorHandler();
        httpsServer = server;
        resolve();
      });
    });
  };

  adapter.close = async (): Promise<void> => {
    if (!httpsServer) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      httpsServer?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    httpsServer = undefined;
  };
};

export const createWebApplication = async (): Promise<XTaskHttpApplication> => {
  configureApplicationCache();
  await bootstrapInfrastructure();
  registerAuthMailer();

  const expressApp = express();
  const newsUpload = createMulterUpload(AppConfig.paths.uploads);
  const adapter = new ExpressAdapter(expressApp, {
    templateEngine: {
      viewsPath: path.join(process.cwd(), "views"),
      extension: "hbs",
      engine: hbsEngine({
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: path.join(process.cwd(), "views", "layouts"),
        partialsDir: path.join(process.cwd(), "views", "partials"),
        helpers: handlebarsHelpers,
      }),
      viewEngine: "hbs",
    },
    staticFiles: { enabled: false },
  });

  expressApp.use(express.static(AppConfig.paths.public, { index: false }));
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(attachInternationalizationRequestState);
  expressApp.use("/admin/news", newsUpload.single("image"));
  expressApp.use(attachHtmlValidationErrorHandler);

  if (AppConfig.ssl.enabled) {
    enableHttpsListener(adapter as ListenableAdapter, expressApp);
  }

  return CreateApplication({
    adapter,
    autoListen: true,
    server: {
      host: AppConfig.host,
      port: AppConfig.port,
    },
  });
};