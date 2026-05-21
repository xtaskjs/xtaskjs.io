import { createAppWriteDataSource } from "./data-source";
import { AppConfig } from "./shared/infrastructure/config/app-config";
import { AdminAccountSeeder } from "./users/infrastructure/typeorm/seeders/admin-account.seeder";

async function seedAdmin(): Promise<void> {
  const dataSource = createAppWriteDataSource(AppConfig.database.write);

  try {
    console.log("[seed:admin] Connecting to database...");
    await dataSource.initialize();

    const seeder = new AdminAccountSeeder();
    await seeder.run(dataSource);
    console.log("[seed:admin] Admin seeder completed.");
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  seedAdmin().catch((error: unknown) => {
    console.error("[seed:admin] Failed:", error);
    process.exit(1);
  });
}

export { seedAdmin };