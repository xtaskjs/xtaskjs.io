import "reflect-metadata";
import dotenv from "dotenv";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { Logger } from "@xtaskjs/common";
import { AppConfig } from "./src/shared/infrastructure/config/app-config";
import { createWebApplication } from "./src/app/create-web-application";

dotenv.config();

mkdirSync(dirname(AppConfig.logging.filePath), { recursive: true });

const bootstrapLogger = new Logger({
  appName: AppConfig.logging.appName,
  context: "Bootstrap",
  useColors: AppConfig.logging.useColors,
  file: {
    enabled: true,
    path: AppConfig.logging.filePath,
  },
});

async function startServer(): Promise<void> {
  const startTime = performance.now();
  
  try {
    const application = await createWebApplication();
    const startupTime = performance.now() - startTime;
    
    const protocol = AppConfig.ssl.enabled ? "https" : "http";
    const concurrency = process.env.XTASK_IMPORT_CONCURRENCY || "10";
    
    bootstrapLogger.info(`Server started on ${protocol}://${AppConfig.host}:${AppConfig.port}`);
    bootstrapLogger.info(`Startup time=${startupTime.toFixed(2)}ms importConcurrency=${concurrency}`);
    bootstrapLogger.info(`Environment=${process.env.NODE_ENV || "development"}`);

    const shutdown = async (): Promise<void> => {
      bootstrapLogger.info("Shutting down gracefully");
      await application.close();
      process.exit(0);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
    bootstrapLogger.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
}

startServer();

