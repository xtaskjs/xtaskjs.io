import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";

test("createWebApplication includes the infrastructure lifecycle bootstrap module", async () => {
  const filePath = path.join(process.cwd(), "src/app/create-web-application.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(
    source,
    /import\s+"\.\.\/shared\/infrastructure\/lifecycle\/infrastructure\.lifecycle";/,
  );
});

test("InfrastructureLifecycle uses serverStarted hooks for datasource bootstrap", async () => {
  const filePath = path.join(process.cwd(), "src/shared/infrastructure/lifecycle/infrastructure.lifecycle.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(source, /@OnEvent\("serverStarted", 200\)/);
  assert.match(source, /@OnEvent\("serverStarted", 100\)/);
  assert.doesNotMatch(source, /@OnEvent\("contextPrepared"/);
});