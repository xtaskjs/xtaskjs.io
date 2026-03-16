import "reflect-metadata";
import dotenv from "dotenv";
import { AppConfig } from "./src/shared/infrastructure/config/app-config";
import { createWebApplication } from "./src/app/create-web-application";

dotenv.config();

async function startServer(): Promise<void> {
  const application = await createWebApplication();
  console.log(`[xtaskjs] running on http://${AppConfig.host}:${AppConfig.port}`);

  const shutdown = async (): Promise<void> => {
    await application.close();
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
