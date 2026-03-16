import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { NewsTypeOrmEntity } from "./news/infrastructure/typeorm/news.typeorm-entity";
import type { AppConfiguration } from "./shared/infrastructure/config/app-config";
import { AppConfig } from "./shared/infrastructure/config/app-config";
import { UserTypeOrmEntity } from "./users/infrastructure/typeorm/user.typeorm-entity";
import { UserLoginEventTypeOrmEntity } from "./users/infrastructure/typeorm/user-login-event.typeorm-entity";

dotenv.config();

type GlobalDataSourceState = typeof globalThis & {
  __xtaskjsAppDataSource?: DataSource;
};

const globalDataSourceState = globalThis as GlobalDataSourceState;

export const createAppDataSource = (databaseConfig: AppConfiguration["database"] = AppConfig.database): DataSource => {
  return new DataSource({
    type: databaseConfig.type,
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: databaseConfig.synchronize,
    entities: [NewsTypeOrmEntity, UserTypeOrmEntity, UserLoginEventTypeOrmEntity],
    migrations: ["src/migrations/*.ts"],
    logging: databaseConfig.logging,
  });
};

export const getAppDataSource = (): DataSource => {
  if (!globalDataSourceState.__xtaskjsAppDataSource) {
    globalDataSourceState.__xtaskjsAppDataSource = createAppDataSource(AppConfig.database);
  }

  return globalDataSourceState.__xtaskjsAppDataSource;
};
