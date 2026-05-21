import { Service } from "@xtaskjs/core";
import { mkdir } from "fs/promises";
import { OnEvent } from "@xtaskjs/common";
import { AppConfig } from "../config/app-config";
import { runMigrations } from "../../../migrate";

@Service()
export class InfrastructureLifecycle {
  private readonly config = AppConfig;

  @OnEvent("serverStarted", 100)
  async runMigrations(): Promise<void> {
    await runMigrations({ shutdownAfterRun: false });
  }

  @OnEvent("serverStarted", 200)
  async ensureDirectories(): Promise<void> {
    await mkdir(this.config.paths.uploads, { recursive: true });
    await mkdir(this.config.paths.logs, { recursive: true });
  }
}