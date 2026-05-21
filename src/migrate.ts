import { initializeTypeOrmIntegration, shutdownTypeOrmIntegration } from "@xtaskjs/typeorm";
import "./shared/infrastructure/typeorm/site.typeorm";

type RunMigrationsOptions = {
  readonly shutdownAfterRun?: boolean;
};

async function runMigrations(options: RunMigrationsOptions = {}): Promise<void> {
  const shouldShutdown = options.shutdownAfterRun ?? true;

  console.log("[migrate] Initializing @xtaskjs/typeorm integration...");
  try {
    await initializeTypeOrmIntegration();
    console.log("[migrate] Migration and seeder lifecycle completed.");
  } finally {
    if (shouldShutdown) {
      await shutdownTypeOrmIntegration();
    }
  }
}

if (require.main === module) {
  runMigrations().catch((err: unknown) => {
    console.error("[migrate] Migration failed:", err);
    process.exit(1);
  });
}

export { runMigrations };
