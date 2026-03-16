import test from "node:test";
import assert from "node:assert/strict";
import {
  extractExportNames,
  renderGeneratedModule,
  resolveSyncCliOptions,
} from "../../src/documentation/application/package-api-sync";

test("extractExportNames collects declarations and aliases", () => {
  const source = [
    "export class BuildService {}",
    "export async function runTask() {}",
    "export const TOKENS = {};",
    "export interface HttpAdapter {}",
    "export type RunnerMeta = {};",
    "export enum Stage { Ready = 'ready' }",
    "const internalName = 1;",
    "export { internalName as exportedName, type RunnerMeta as RunnerMetaAlias };",
  ].join("\n");

  const names = extractExportNames(source);

  assert.deepEqual(names.sort(), [
    "BuildService",
    "HttpAdapter",
    "RunnerMeta",
    "RunnerMetaAlias",
    "Stage",
    "TOKENS",
    "exportedName",
    "runTask",
  ].sort());
});

test("resolveSyncCliOptions accepts workspace and output path", () => {
  const options = resolveSyncCliOptions(
    ["/tmp/xtask", "/tmp/generated.ts"],
    {}
  );

  assert.equal(options.workspaceRoot, "/tmp/xtask");
  assert.equal(options.outputFilePath, "/tmp/generated.ts");
});

test("renderGeneratedModule emits the typed generated export", () => {
  const rendered = renderGeneratedModule({
    core: [
      {
        title: "Bootstrap and app",
        sourcePath: "packages/core/src",
        exports: ["CreateApplication"],
      },
    ],
  });

  assert.match(rendered, /generatedPackageApiGroups/);
  assert.match(rendered, /CreateApplication/);
  assert.match(rendered, /Readonly<Record<string/);
});