import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type PackageApiGroup = {
  readonly title: string;
  readonly sourcePath: string;
  readonly exports: readonly string[];
};

export type GroupSpec = {
  readonly title: string;
  readonly sourcePath: string;
  readonly preferredExports: readonly string[];
  readonly requiredMarkers?: readonly string[];
  readonly fallbackExports?: readonly string[];
};

export type PackageSpec = {
  readonly packageRoot: string;
  readonly groups: readonly GroupSpec[];
};

export const packageSpecs: Readonly<Record<string, PackageSpec>> = {
  core: {
    packageRoot: "packages/core",
    groups: [
      {
        title: "Bootstrap and app",
        sourcePath: "packages/core/src",
        preferredExports: ["CreateApplication", "Bootstrap", "XTaskHttpApplication", "createHttpAdapter"],
      },
      {
        title: "DI and components",
        sourcePath: "packages/core/src/di",
        preferredExports: ["Component", "Service", "Controller", "Repository", "AutoWired", "Qualifier"],
      },
      {
        title: "HTTP primitives",
        sourcePath: "packages/core/src/http",
        preferredExports: ["HttpAdapter", "HttpRequestLike", "HttpResponseLike", "HttpViewResult", "view", "NodeHttpAdapter", "FastifyAdapter"],
      },
    ],
  },
  common: {
    packageRoot: "packages/common",
    groups: [
      {
        title: "Routing decorators",
        sourcePath: "packages/common/src/decorators/core/server",
        preferredExports: ["Controller", "Get", "Post", "Patch", "Delete", "UseGuards", "UseMiddlewares", "UsePipes"],
      },
      {
        title: "Lifecycle decorators",
        sourcePath: "packages/common/src/decorators/core/server",
        preferredExports: ["OnEvent", "ApplicationRunner", "CommandLineRunner"],
      },
      {
        title: "Validation and types",
        sourcePath: "packages/common/src",
        preferredExports: ["Logger", "ValidationPipe", "HANDLERS_KEY", "ROUTES_KEY", "RunnerMeta"],
      },
    ],
  },
  "express-http": {
    packageRoot: "packages/express-http",
    groups: [
      {
        title: "Adapter runtime",
        sourcePath: "packages/express-http/src",
        preferredExports: ["ExpressAdapter", "view", "HttpAdapter", "HttpRequestHandler"],
      },
      {
        title: "Request and response types",
        sourcePath: "packages/express-http/src/types.ts",
        preferredExports: ["HttpRequestLike", "HttpResponseLike", "HttpServerOptions", "HttpViewResult", "HttpAdapterType"],
      },
      {
        title: "Adapter options",
        sourcePath: "packages/express-http/src/types.ts",
        preferredExports: ["ExpressAdapterOptions", "ExpressTemplateEngineOptions", "ExpressStaticFilesOptions"],
      },
    ],
  },
  "fastify-http": {
    packageRoot: "packages/fastify-http",
    groups: [
      {
        title: "Adapter runtime",
        sourcePath: "packages/fastify-http/src",
        preferredExports: ["FastifyAdapter", "view", "HttpAdapter", "HttpRequestHandler"],
      },
      {
        title: "Request and response types",
        sourcePath: "packages/fastify-http/src/types.ts",
        preferredExports: ["HttpRequestLike", "HttpResponseLike", "HttpServerOptions", "HttpViewResult", "HttpAdapterType"],
      },
      {
        title: "Adapter options",
        sourcePath: "packages/fastify-http/src/types.ts",
        preferredExports: ["FastifyAdapterOptions", "FastifyTemplateEngineOptions", "FastifyStaticFilesOptions"],
      },
    ],
  },
  typeorm: {
    packageRoot: "packages/typeorm",
    groups: [
      {
        title: "TypeORM bridge",
        sourcePath: "packages/typeorm/src/configuration.ts",
        preferredExports: ["registerTypeOrmDataSource", "TypeOrmDataSource", "InjectDataSource", "InjectRepository"],
      },
      {
        title: "Re-exported ORM APIs",
        sourcePath: "packages/typeorm/src/index.ts",
        preferredExports: ["DataSource", "Entity", "Column", "PrimaryGeneratedColumn", "OneToMany", "ManyToOne", "Repository"],
        requiredMarkers: ['export * from "typeorm"', "export * from 'typeorm'"],
        fallbackExports: ["DataSource", "Entity", "Column", "PrimaryGeneratedColumn", "OneToMany", "ManyToOne", "Repository"],
      },
      {
        title: "Lifecycle surface",
        sourcePath: "packages/typeorm/src/lifecycle.ts",
        preferredExports: ["initializeTypeOrmIntegration", "shutdownTypeOrmIntegration"],
      },
    ],
  },
  security: {
    packageRoot: "packages/security",
    groups: [
      {
        title: "Route decorators",
        sourcePath: "packages/security/src/decorators.ts",
        preferredExports: ["Authenticated", "Auth", "Roles", "AllowAnonymous"],
      },
      {
        title: "Strategy APIs",
        sourcePath: "packages/security/src/configuration.ts",
        preferredExports: ["registerJwtStrategy", "registerJweStrategy", "JwtSecurityStrategy", "JweSecurityStrategy"],
      },
      {
        title: "Injected services",
        sourcePath: "packages/security/src/lifecycle.ts",
        preferredExports: ["InjectAuthenticationService", "InjectAuthorizationService", "InjectPassport", "InjectSecurityLifecycleManager"],
      },
    ],
  },
  mailer: {
    packageRoot: "packages/mailer",
    groups: [
      {
        title: "Transport registration",
        sourcePath: "packages/mailer/src/configuration.ts",
        preferredExports: ["registerMailerTransport", "createMailtrapTransportOptions", "registerMailerTemplate", "InjectMailerTransport"],
      },
      {
        title: "Service and templates",
        sourcePath: "packages/mailer/src",
        preferredExports: ["MailerService", "InjectMailerService", "registerEjsTemplateRenderer", "registerHandlebarsTemplateRenderer"],
      },
      {
        title: "Lifecycle surface",
        sourcePath: "packages/mailer/src/lifecycle.ts",
        preferredExports: ["InjectMailerLifecycleManager", "initializeMailerIntegration", "shutdownMailerIntegration"],
      },
    ],
  },
  internationalization: {
    packageRoot: "packages/internationalization",
    groups: [
      {
        title: "Configuration and locales",
        sourcePath: "packages/internationalization/src/configuration.ts",
        preferredExports: ["configureInternationalization", "Internationalization", "registerInternationalizationLocale", "InternationalizationLocale", "InternationalizationResolver"],
      },
      {
        title: "Translation runtime",
        sourcePath: "packages/internationalization/src",
        preferredExports: ["InternationalizationService", "InjectInternationalizationService", "runWithInternationalizationContext"],
      },
      {
        title: "Formatting and lifecycle",
        sourcePath: "packages/internationalization/src/lifecycle.ts",
        preferredExports: ["registerInternationalizationFormatter", "InjectInternationalizationLifecycleManager", "initializeInternationalizationIntegration", "shutdownInternationalizationIntegration"],
      },
    ],
  },
  scheduler: {
    packageRoot: "packages/scheduler",
    groups: [
      {
        title: "Scheduling decorators",
        sourcePath: "packages/scheduler/src/decorators.ts",
        preferredExports: ["Cron", "Every", "Interval", "Timeout"],
      },
      {
        title: "Runtime control",
        sourcePath: "packages/scheduler/src/scheduler.service.ts",
        preferredExports: ["SchedulerService", "InjectSchedulerService"],
      },
      {
        title: "Lifecycle surface",
        sourcePath: "packages/scheduler/src/lifecycle.ts",
        preferredExports: ["InjectSchedulerLifecycleManager", "initializeSchedulerIntegration", "shutdownSchedulerIntegration"],
      },
    ],
  },
  cache: {
    packageRoot: "packages/cache",
    groups: [
      {
        title: "Configuration and models",
        sourcePath: "packages/cache/src/configuration.ts",
        preferredExports: ["configureCache", "registerCacheModel", "CacheSettings", "CacheModel"],
      },
      {
        title: "Repository and services",
        sourcePath: "packages/cache/src",
        preferredExports: ["CacheRepository", "CacheService", "CacheAdminService", "InjectCacheService", "InjectCacheRepository"],
      },
      {
        title: "HTTP caching and management",
        sourcePath: "packages/cache/src",
        preferredExports: [
          "HttpCacheService",
          "InjectHttpCacheService",
          "CacheResponse",
          "BrowserCache",
          "CacheView",
          "NoStore",
          "NoCache",
          "VaryBy",
          "createCacheManagementController",
          "InjectCacheAdminService",
        ],
      },
      {
        title: "Lifecycle surface",
        sourcePath: "packages/cache/src/lifecycle.ts",
        preferredExports: ["InjectCacheLifecycleManager", "initializeCacheIntegration", "shutdownCacheIntegration", "resetCacheIntegration"],
      },
    ],
  },
};

export type SyncPackageApiGroupsOptions = {
  readonly workspaceRoot: string;
  readonly outputFilePath?: string;
};

export type SyncPackageApiGroupsResult = {
  readonly outputFilePath: string;
  readonly generatedGroups: Record<string, readonly PackageApiGroup[]>;
};

export const defaultGeneratedFilePath = path.join(
  process.cwd(),
  "src",
  "documentation",
  "application",
  "generated-package-api-groups.ts"
);

export function resolveSyncCliOptions(
  args: readonly string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env
): SyncPackageApiGroupsOptions {
  const workspaceRootInput = args[0] || env.XTASKJS_WORKSPACE;

  if (!workspaceRootInput) {
    throw new Error(
      "Usage: npm run docs:sync-package-apis -- /absolute/path/to/xtaskjs/xtask [output-file-path]"
    );
  }

  return {
    workspaceRoot: path.resolve(workspaceRootInput),
    outputFilePath: path.resolve(args[1] || env.XTASKJS_DOCS_API_OUTPUT || defaultGeneratedFilePath),
  };
}

export async function syncPackageApiGroups(
  options: SyncPackageApiGroupsOptions
): Promise<SyncPackageApiGroupsResult> {
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const outputFilePath = path.resolve(options.outputFilePath || defaultGeneratedFilePath);
  const generatedGroups: Record<string, readonly PackageApiGroup[]> = {};

  for (const [slug, packageSpec] of Object.entries(packageSpecs)) {
    const packageSourceRoot = path.join(workspaceRoot, packageSpec.packageRoot, "src");
    const files = await collectTypeScriptFiles(packageSourceRoot);
    const exportIndex = await buildExportIndex(files);

    generatedGroups[slug] = await Promise.all(
      packageSpec.groups.map(async (group) => ({
        title: group.title,
        sourcePath: group.sourcePath,
        exports: await resolveGroupExports(group, exportIndex, workspaceRoot),
      }))
    );
  }

  await writeFile(outputFilePath, renderGeneratedModule(generatedGroups), "utf8");

  return {
    outputFilePath,
    generatedGroups,
  };
}

export async function runPackageApiSyncCli(
  args: readonly string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env
): Promise<SyncPackageApiGroupsResult> {
  const options = resolveSyncCliOptions(args, env);
  const result = await syncPackageApiGroups(options);
  console.log(`Wrote ${result.outputFilePath}`);
  return result;
}

export async function resolveGroupExports(
  group: GroupSpec,
  exportIndex: Map<string, string>,
  workspaceRoot: string
): Promise<readonly string[]> {
  const selected = group.preferredExports.filter((entry) => exportIndex.has(entry));

  if (selected.length > 0) {
    return selected;
  }

  if (group.requiredMarkers && group.fallbackExports) {
    const source = await readFile(path.join(workspaceRoot, group.sourcePath), "utf8").catch(() => "");
    if (group.requiredMarkers.some((marker) => source.includes(marker))) {
      return group.fallbackExports;
    }
  }

  throw new Error(`Could not resolve exports for ${group.title} from ${group.sourcePath}`);
}

export async function collectTypeScriptFiles(rootPath: string): Promise<string[]> {
  const entries = await readdir(rootPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...await collectTypeScriptFiles(absolutePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (
      !entry.name.endsWith(".ts") ||
      entry.name.endsWith(".d.ts") ||
      entry.name.endsWith(".test.ts") ||
      entry.name.endsWith(".spec.ts")
    ) {
      continue;
    }

    results.push(absolutePath);
  }

  return results;
}

export async function buildExportIndex(files: readonly string[]): Promise<Map<string, string>> {
  const exportIndex = new Map<string, string>();

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    for (const exportName of extractExportNames(source)) {
      if (!exportIndex.has(exportName)) {
        exportIndex.set(exportName, filePath);
      }
    }
  }

  return exportIndex;
}

export function extractExportNames(source: string): string[] {
  const names = new Set<string>();
  const patterns = [
    /export\s+(?:declare\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)/g,
    /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g,
    /export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)/g,
    /export\s+interface\s+([A-Za-z0-9_]+)/g,
    /export\s+type\s+([A-Za-z0-9_]+)/g,
    /export\s+enum\s+([A-Za-z0-9_]+)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      names.add(match[1]);
    }
  }

  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of match[1].split(",")) {
      const normalized = part.trim().replace(/^type\s+/, "");
      if (!normalized) {
        continue;
      }

      const [left, right] = normalized.split(/\s+as\s+/i).map((entry) => entry.trim());
      names.add(right || left);
    }
  }

  return Array.from(names);
}

export function renderGeneratedModule(groups: Record<string, readonly PackageApiGroup[]>): string {
  return [
    "/* This file is auto-generated by scripts/sync-package-api-groups.ts. */",
    "export const generatedPackageApiGroups: Readonly<Record<string, readonly { readonly title: string; readonly sourcePath: string; readonly exports: readonly string[]; }[]>> = ",
    `${JSON.stringify(groups, null, 2)};`,
    "",
  ].join("\n");
}