import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";

test("createWebApplication includes the infrastructure lifecycle bootstrap module", async () => {
  const filePath = path.join(process.cwd(), "src/app/create-web-application.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(
    source,
    /import\s+"\.\.\/shared\/infrastructure\/typeorm\/site\.typeorm";/,
  );
  assert.match(
    source,
    /import\s+"\.\.\/shared\/infrastructure\/cqrs\/site\.cqrs";/,
  );
  assert.match(
    source,
    /import\s+"\.\.\/shared\/infrastructure\/event-source\/site\.event-source";/,
  );
  assert.match(
    source,
    /import\s+"\.\.\/shared\/infrastructure\/lifecycle\/infrastructure\.lifecycle";/,
  );
});

test("InfrastructureLifecycle uses serverStarted hooks for persistence bootstrap", async () => {
  const filePath = path.join(process.cwd(), "src/shared/infrastructure/lifecycle/infrastructure.lifecycle.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(source, /@OnEvent\("serverStarted", 200\)/);
  assert.match(source, /@OnEvent\("serverStarted", 100\)/);
  assert.match(source, /runMigrations\(\)/);
  assert.doesNotMatch(source, /@OnEvent\("stopping", 100\)/);
  assert.doesNotMatch(source, /@OnEvent\("contextPrepared"/);
});