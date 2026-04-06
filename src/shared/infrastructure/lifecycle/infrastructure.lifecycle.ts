import { AutoWired, Service } from "@xtaskjs/core";
import { mkdir } from "fs/promises";
import { OnEvent } from "@xtaskjs/common";
import { AppConfig } from "../config/app-config";
import { UserService } from "../../../users/application/user.service";
import { getAppReadDataSource, getAppWriteDataSource } from "../../../data-source";

@Service()
export class InfrastructureLifecycle {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  private readonly config = AppConfig;

  @OnEvent("serverStarted", 200)
  async ensureDirectories(): Promise<void> {
    await mkdir(this.config.paths.uploads, { recursive: true });
  }

  @OnEvent("serverStarted", 100)
  async initializePersistence(): Promise<void> {
    const writeDataSource = getAppWriteDataSource();
    const readDataSource = getAppReadDataSource();

    if (!writeDataSource.isInitialized) {
      await writeDataSource.initialize();
    }

    if (!readDataSource.isInitialized) {
      await readDataSource.initialize();
    }

    await writeDataSource.runMigrations();
    await this.userService.ensureAdminAccount();
  }
}