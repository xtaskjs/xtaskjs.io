import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "fs/promises";
import os from "os";
import path from "path";
import { createXtaskWorkspaceFixture } from "../support/create-xtask-workspace-fixture";

const execFileAsync = promisify(execFile);

test("docs sync CLI happy path writes a generated package API module", async () => {
  const fixture = await createXtaskWorkspaceFixture();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "xtask-cli-output-"));
  const outputFilePath = path.join(tempDir, "generated-package-api-groups.ts");

  try {
    const { stdout } = await execFileAsync(
      "npm",
      ["run", "docs:sync-package-apis", "--", fixture.workspaceRoot, outputFilePath],
      { cwd: process.cwd() }
    );

    const written = await readFile(outputFilePath, "utf8");

    assert.match(stdout, /Wrote/);
    assert.match(written, /generatedPackageApiGroups/);
    assert.match(written, /registerMailerTransport/);
  } finally {
    await fixture.cleanup();
    await rm(tempDir, { recursive: true, force: true });
  }
});