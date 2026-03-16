import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { packageSpecs } from "../../src/documentation/application/package-api-sync";

export type WorkspaceFixture = {
  readonly workspaceRoot: string;
  cleanup(): Promise<void>;
};

export async function createXtaskWorkspaceFixture(): Promise<WorkspaceFixture> {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "xtask-workspace-"));
  const fileContents = new Map<string, string[]>();

  for (const packageSpec of Object.values(packageSpecs)) {
    for (const group of packageSpec.groups) {
      const targetPath = path.join(
        workspaceRoot,
        group.sourcePath.endsWith(".ts") ? group.sourcePath : path.join(group.sourcePath, "index.ts")
      );
      const snippets = fileContents.get(targetPath) || [];

      if (group.requiredMarkers && group.fallbackExports) {
        snippets.push(group.requiredMarkers[0]);
      } else {
        snippets.push(...group.preferredExports.map((entry) => `export const ${entry} = "${entry}";`));
      }

      fileContents.set(targetPath, snippets);
    }
  }

  for (const [filePath, snippets] of fileContents.entries()) {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${Array.from(new Set(snippets)).join("\n")}\n`, "utf8");
  }

  return {
    workspaceRoot,
    async cleanup() {
      await rm(workspaceRoot, { recursive: true, force: true });
    },
  };
}