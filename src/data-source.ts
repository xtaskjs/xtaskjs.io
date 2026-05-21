import "reflect-metadata";
import dotenv from "dotenv";
import { getTypeOrmLifecycleManager, type XTaskTypeOrmDataSourceOptions } from "@xtaskjs/typeorm";
import { DataSource } from "typeorm";
import { NewsTypeOrmEntity } from "./news/infrastructure/typeorm/news.typeorm-entity";
import type { AppConfiguration } from "./shared/infrastructure/config/app-config";
import { AppConfig } from "./shared/infrastructure/config/app-config";
import { UserTypeOrmEntity } from "./users/infrastructure/typeorm/user.typeorm-entity";
import { UserLoginEventTypeOrmEntity } from "./users/infrastructure/typeorm/user-login-event.typeorm-entity";
import { CreateNewsTable1741737600000 } from "./migrations/1741737600000-CreateNewsTable";
import { CreateUsersTable1741824000000 } from "./migrations/1741824000000-CreateUsersTable";
import { AddUserSecurityColumns1741996800000 } from "./migrations/1741996800000-AddUserSecurityColumns";
import { AddUserAccessTracking1742083200000 } from "./migrations/1742083200000-AddUserAccessTracking";
import { AddUserCommunicationPreferences1773792000000 } from "./migrations/1773792000000-AddUserCommunicationPreferences";
import { CreateUserAccountEventStoreTable1773878400000 } from "./migrations/1773878400000-CreateUserAccountEventStoreTable";

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
const migrationClasses = [
  CreateNewsTable1741737600000,
  CreateUsersTable1741824000000,
  AddUserSecurityColumns1741996800000,
  AddUserAccessTracking1742083200000,
  AddUserCommunicationPreferences1773792000000,
  CreateUserAccountEventStoreTable1773878400000,
];

const createNamedDataSourceOptions = (
  name: string,
  databaseConfig: DatabaseConnectionConfig,
  initializeOnServerStart = true,
  runMigrationsOnServerStart = false,
  runSeedersOnServerStart = false
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
    migrations: migrationClasses,
    logging: databaseConfig.logging,
    runMigrationsOnServerStart,
    runSeedersOnServerStart,
  };
};

export const createAppWriteDataSourceOptions = (
  databaseConfig: DatabaseConnectionConfig = AppConfig.database.write
): XTaskTypeOrmDataSourceOptions => {
  return createNamedDataSourceOptions(
    APP_TYPEORM_WRITE_DATA_SOURCE_NAME,
    databaseConfig,
    true,
    true,
    true
  );
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
