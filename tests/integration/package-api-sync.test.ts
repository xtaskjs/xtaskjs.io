import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "fs/promises";
import os from "os";
import path from "path";
import { syncPackageApiGroups } from "../../src/documentation/application/package-api-sync";
import { createXtaskWorkspaceFixture } from "../support/create-xtask-workspace-fixture";

test("syncPackageApiGroups generates API groups from a workspace fixture", async () => {
  const fixture = await createXtaskWorkspaceFixture();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "xtask-output-"));
  const outputFilePath = path.join(tempDir, "generated-package-api-groups.ts");

  try {
    const result = await syncPackageApiGroups({
      workspaceRoot: fixture.workspaceRoot,
      outputFilePath,
    });

    assert.ok(result.generatedGroups.core);
    assert.deepEqual(result.generatedGroups.core[0]?.exports, [
      "CreateApplication",
      "Bootstrap",
      "XTaskHttpApplication",
      "createHttpAdapter",
    ]);
    assert.deepEqual(result.generatedGroups.typeorm[1]?.exports, [
      "DataSource",
      "Entity",
      "Column",
      "PrimaryGeneratedColumn",
      "OneToMany",
      "ManyToOne",
      "Repository",
    ]);
    assert.deepEqual(result.generatedGroups.queues[0]?.exports, [
      "configureQueues",
      "registerQueueTransport",
      "registerInMemoryQueueTransport",
      "createRabbitMqTransport",
      "createMqttTransport",
    ]);

    const written = await readFile(outputFilePath, "utf8");
    assert.match(written, /generatedPackageApiGroups/);
    assert.match(written, /CreateApplication/);
    assert.match(written, /InjectSchedulerService/);
    assert.match(written, /QueueHandler/);
  } finally {
    await fixture.cleanup();
    await rm(tempDir, { recursive: true, force: true });
  }
});