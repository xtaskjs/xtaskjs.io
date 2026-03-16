import { runPackageApiSyncCli } from "../src/documentation/application/package-api-sync";

runPackageApiSyncCli().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});