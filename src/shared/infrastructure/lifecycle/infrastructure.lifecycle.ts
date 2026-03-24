import { AutoWired, Service } from "@xtaskjs/core";
import { mkdir } from "fs/promises";
import { OnEvent } from "@xtaskjs/common";
import type { DataSource } from "typeorm";
import { AppConfig } from "../config/app-config";
import { UserService } from "../../../users/application/user.service";
import { getAppDataSource } from "../../../data-source";

@Service()
export class InfrastructureLifecycle {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  private readonly config = AppConfig;
  private readonly dataSource: DataSource = getAppDataSource();

  @OnEvent("serverStarted", 200)
  async ensureDirectories(): Promise<void> {
    await mkdir(this.config.paths.uploads, { recursive: true });
  }

  @OnEvent("serverStarted", 100)
  async initializeDataSource(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    await this.dataSource.runMigrations();
    await this.userService.ensureAdminAccount();
  }

  @OnEvent("stopping", 100)
  async destroyDataSource(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}