import "reflect-metadata";
import dotenv from "dotenv";
import { getTypeOrmLifecycleManager, type XTaskTypeOrmDataSourceOptions } from "@xtaskjs/typeorm";
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

export const APP_TYPEORM_DATA_SOURCE_NAME = "default";

export const createAppDataSourceOptions = (
  databaseConfig: AppConfiguration["database"] = AppConfig.database
): XTaskTypeOrmDataSourceOptions => {
  return {
    name: APP_TYPEORM_DATA_SOURCE_NAME,
    initializeOnServerStart: true,
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
  };
};

export const createAppDataSource = (databaseConfig: AppConfiguration["database"] = AppConfig.database): DataSource => {
  return new DataSource(createAppDataSourceOptions(databaseConfig));
};

const resolveTypeOrmManagedDataSource = (): DataSource | null => {
  try {
    const dataSource = getTypeOrmLifecycleManager().getDataSource(APP_TYPEORM_DATA_SOURCE_NAME);
    globalDataSourceState.__xtaskjsAppDataSource = dataSource;
    return dataSource;
  } catch {
    return null;
  }
};

export const getAppDataSource = (): DataSource => {
  const managedDataSource = resolveTypeOrmManagedDataSource();
  if (managedDataSource) {
    return managedDataSource;
  }

  if (!globalDataSourceState.__xtaskjsAppDataSource) {
    globalDataSourceState.__xtaskjsAppDataSource = createAppDataSource(AppConfig.database);
  }

  return globalDataSourceState.__xtaskjsAppDataSource;
};
