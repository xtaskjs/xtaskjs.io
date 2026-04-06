import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { getEventSourceConfiguration, resetEventSourceConfiguration } from "@xtaskjs/event-source";

const eventSourceBootstrapModule = "../../src/shared/infrastructure/event-source/site.event-source";

const loadFreshModule = (modulePath: string): void => {
  delete require.cache[require.resolve(modulePath)];
  require(modulePath);
};

test("Event-source bootstrap configures a TypeORM-backed store for the write datasource", async () => {
  resetEventSourceConfiguration();

  try {
    loadFreshModule(eventSourceBootstrapModule);

    const configuration = getEventSourceConfiguration();
    assert.equal(configuration.autoPublish, true);
    assert.equal(configuration.store.constructor.name, "TypeOrmEventStore");

    const filePath = path.join(process.cwd(), "src/shared/infrastructure/event-source/site.event-source.ts");
    const source = await readFile(filePath, "utf8");
    assert.match(source, /@EventSource\(/);
    assert.match(source, /createTypeOrmEventStore\(/);
    assert.match(source, /APP_TYPEORM_WRITE_DATA_SOURCE_NAME/);
    assert.match(source, /user_account_event_store/);
  } finally {
    resetEventSourceConfiguration();
    delete require.cache[require.resolve(eventSourceBootstrapModule)];
  }
});