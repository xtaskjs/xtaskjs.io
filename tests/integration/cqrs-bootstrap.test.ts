import test from "node:test";
import assert from "node:assert/strict";
import { getCqrsConfiguration, resetCqrsConfiguration } from "@xtaskjs/cqrs";
import { clearRegisteredTypeOrmDataSources, getRegisteredTypeOrmDataSources } from "@xtaskjs/typeorm";
import {
  APP_TYPEORM_DATA_SOURCE_NAME,
  APP_TYPEORM_READ_DATA_SOURCE_NAME,
} from "../../src/data-source";

const typeOrmBootstrapModule = "../../src/shared/infrastructure/typeorm/site.typeorm";
const cqrsBootstrapModule = "../../src/shared/infrastructure/cqrs/site.cqrs";

const loadFreshModule = (modulePath: string): void => {
  delete require.cache[require.resolve(modulePath)];
  require(modulePath);
};

test("CQRS bootstrap registers datasource aliases for the xtaskjs container lifecycle", () => {
  clearRegisteredTypeOrmDataSources();
  resetCqrsConfiguration();

  try {
    loadFreshModule(typeOrmBootstrapModule);
    loadFreshModule(cqrsBootstrapModule);

    const registration = getRegisteredTypeOrmDataSources().find(
      (dataSource) => dataSource.name === APP_TYPEORM_DATA_SOURCE_NAME
    );
    const readRegistration = getRegisteredTypeOrmDataSources().find(
      (dataSource) => dataSource.name === APP_TYPEORM_READ_DATA_SOURCE_NAME
    );
    assert.ok(registration);
    assert.ok(readRegistration);
    assert.equal(registration?.initializeOnServerStart, true);
    assert.equal(readRegistration?.initializeOnServerStart, true);

    const configuration = getCqrsConfiguration();
    assert.equal(configuration.readDataSourceName, APP_TYPEORM_READ_DATA_SOURCE_NAME);
    assert.equal(configuration.writeDataSourceName, APP_TYPEORM_DATA_SOURCE_NAME);
  } finally {
    clearRegisteredTypeOrmDataSources();
    resetCqrsConfiguration();
    delete require.cache[require.resolve(typeOrmBootstrapModule)];
    delete require.cache[require.resolve(cqrsBootstrapModule)];
  }
});