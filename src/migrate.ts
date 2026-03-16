import { createAppDataSource } from "./data-source";
import { AppConfig } from "./shared/infrastructure/config/app-config";

async function runMigrations(): Promise<void> {
  const dataSource = createAppDataSource(AppConfig.database);
  console.log("[migrate] Connecting to database...");
  await dataSource.initialize();
  console.log("[migrate] Running pending migrations...");
  const ran = await dataSource.runMigrations();
  if (ran.length === 0) {
    console.log("[migrate] No pending migrations.");
  } else {
    console.log(`[migrate] Ran ${ran.length} migration(s): ${ran.map((m) => m.name).join(", ")}`);
  }
  await dataSource.destroy();
}

if (require.main === module) {
  runMigrations().catch((err: unknown) => {
    console.error("[migrate] Migration failed:", err);
    process.exit(1);
  });
}

export { runMigrations };
