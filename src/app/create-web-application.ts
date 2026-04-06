import express from "express";
import path from "path";
import { readFileSync } from "fs";
import { createServer as createHttpsServer, type Server as HttpsServer } from "https";
import { engine as hbsEngine } from "express-handlebars";
import { CreateApplication, type XTaskHttpApplication } from "@xtaskjs/core";
import { configureCache } from "@xtaskjs/cache";
import { ExpressAdapter } from "@xtaskjs/express-http";
import { AppConfig } from "../shared/infrastructure/config/app-config";
import { handlebarsHelpers } from "../shared/infrastructure/http/handlebars-helpers";
import { attachHtmlValidationErrorHandler } from "../shared/infrastructure/http/html-validation-error-handler";
import { attachInternationalizationRequestState } from "../shared/infrastructure/http/internationalization-request.middleware";
import { createMulterUpload } from "../shared/infrastructure/http/multer.factory";
import "../shared/infrastructure/typeorm/site.typeorm";
import "../shared/infrastructure/cqrs/site.cqrs";
import "../shared/infrastructure/event-source/site.event-source";
import "../auth/infrastructure/security/admin-jwt-security.strategy";
import { registerAuthMailer } from "../auth/infrastructure/mailer/register-auth-mailer";
import "../shared/infrastructure/internationalization/site.internationalization";
import "../shared/infrastructure/lifecycle/infrastructure.lifecycle";

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