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

type DatabaseConnectionConfig = AppConfiguration["database"]["write"];

type GlobalDataSourceState = typeof globalThis & {
  __xtaskjsWriteDataSource?: DataSource;
  __xtaskjsReadDataSource?: DataSource;
};

const globalDataSourceState = globalThis as GlobalDataSourceState;

export const APP_TYPEORM_WRITE_DATA_SOURCE_NAME = "default";
export const APP_TYPEORM_READ_DATA_SOURCE_NAME = "read-replica";
export const APP_TYPEORM_DATA_SOURCE_NAME = APP_TYPEORM_WRITE_DATA_SOURCE_NAME;

const entityClasses = [NewsTypeOrmEntity, UserTypeOrmEntity, UserLoginEventTypeOrmEntity];

const createNamedDataSourceOptions = (
  name: string,
  databaseConfig: DatabaseConnectionConfig,
  initializeOnServerStart = true
): XTaskTypeOrmDataSourceOptions => {
  return {
    name,
    initializeOnServerStart,
    type: databaseConfig.type,
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: databaseConfig.synchronize,
    entities: entityClasses,
    migrations: ["src/migrations/*.ts"],
    logging: databaseConfig.logging,
  };
};

export const createAppWriteDataSourceOptions = (
  databaseConfig: DatabaseConnectionConfig = AppConfig.database.write
): XTaskTypeOrmDataSourceOptions => {
  return createNamedDataSourceOptions(APP_TYPEORM_WRITE_DATA_SOURCE_NAME, databaseConfig);
};

export const createAppReadDataSourceOptions = (
  databaseConfig: DatabaseConnectionConfig = AppConfig.database.read
): XTaskTypeOrmDataSourceOptions => {
  return createNamedDataSourceOptions(APP_TYPEORM_READ_DATA_SOURCE_NAME, databaseConfig);
};

export const createAppDataSourceOptions = createAppWriteDataSourceOptions;

export const createAppWriteDataSource = (databaseConfig: DatabaseConnectionConfig = AppConfig.database.write): DataSource => {
  return new DataSource(createAppWriteDataSourceOptions(databaseConfig));
};

export const createAppReadDataSource = (databaseConfig: DatabaseConnectionConfig = AppConfig.database.read): DataSource => {
  return new DataSource(createAppReadDataSourceOptions(databaseConfig));
};

export const createAppDataSource = createAppWriteDataSource;

const resolveTypeOrmManagedDataSource = (name: string): DataSource | null => {
  try {
    const dataSource = getTypeOrmLifecycleManager().getDataSource(name);

    if (name === APP_TYPEORM_READ_DATA_SOURCE_NAME) {
      globalDataSourceState.__xtaskjsReadDataSource = dataSource;
    } else {
      globalDataSourceState.__xtaskjsWriteDataSource = dataSource;
    }

    return dataSource;
  } catch {
    return null;
  }
};

export const getAppWriteDataSource = (): DataSource => {
  const managedDataSource = resolveTypeOrmManagedDataSource(APP_TYPEORM_WRITE_DATA_SOURCE_NAME);
  if (managedDataSource) {
    return managedDataSource;
  }

  if (!globalDataSourceState.__xtaskjsWriteDataSource) {
    globalDataSourceState.__xtaskjsWriteDataSource = createAppWriteDataSource(AppConfig.database.write);
  }

  return globalDataSourceState.__xtaskjsWriteDataSource;
};

export const getAppReadDataSource = (): DataSource => {
  const managedDataSource = resolveTypeOrmManagedDataSource(APP_TYPEORM_READ_DATA_SOURCE_NAME);
  if (managedDataSource) {
    return managedDataSource;
  }

  if (!globalDataSourceState.__xtaskjsReadDataSource) {
    globalDataSourceState.__xtaskjsReadDataSource = createAppReadDataSource(AppConfig.database.read);
  }

  return globalDataSourceState.__xtaskjsReadDataSource;
};

export const getAppDataSource = getAppWriteDataSource;
