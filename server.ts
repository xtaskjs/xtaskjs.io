import "reflect-metadata";
import dotenv from "dotenv";
import { AppConfig } from "./src/shared/infrastructure/config/app-config";
import { createWebApplication } from "./src/app/create-web-application";

dotenv.config();

async function startServer(): Promise<void> {
  const startTime = performance.now();
  
  try {
    const application = await createWebApplication();
    const startupTime = performance.now() - startTime;
    
    const protocol = AppConfig.ssl.enabled ? "https" : "http";
    const concurrency = process.env.XTASK_IMPORT_CONCURRENCY || "10";
    
    console.log(`\n╭────────────────────────────────────────╮`);
    console.log(`│  ✓ xTaskjs Server Started              │`);
    console.log(`├────────────────────────────────────────┤`);
    console.log(`│  🌐 ${protocol}://${AppConfig.host}:${AppConfig.port}`.padEnd(40) + `│`);
    console.log(`│  ⚡ Startup time: ${startupTime.toFixed(2)}ms`.padEnd(40) + `│`);
    console.log(`│  🔄 Import concurrency: ${concurrency}`.padEnd(40) + `│`);
    console.log(`│  📦 Environment: ${process.env.NODE_ENV || "development"}`.padEnd(40) + `│`);
    console.log(`╰────────────────────────────────────────╯\n`);

    const shutdown = async (): Promise<void> => {
      console.log("\n🛑 Shutting down gracefully...");
      await application.close();
      process.exit(0);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("\n❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

