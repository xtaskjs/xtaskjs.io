import { Service } from "@xtaskjs/core";

export type ProjectPackageViewModel = {
  readonly name: string;
  readonly latestVersion: string;
  readonly publishedAt: string | null;
  readonly publishedAtLabel: string;
  readonly description: string;
  readonly npmUrl: string;
};

type NpmSearchResponse = {
  readonly objects?: Array<{
    readonly package?: {
      readonly name?: string;
      readonly version?: string;
      readonly description?: string;
      readonly date?: string;
      readonly links?: {
        readonly npm?: string;
      };
    };
  }>;
};

type CachedCatalog = {
  readonly expiresAt: number;
  readonly packages: readonly ProjectPackageViewModel[];
};

const CATALOG_URL = "https://registry.npmjs.org/-/v1/search?text=%40xtaskjs&size=250";
const CACHE_TTL_MS = 1000 * 60 * 30;

const publishedAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const fallbackPackages: readonly ProjectPackageViewModel[] = [
  {
    name: "@xtaskjs/cache",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Memory and Redis-backed cache models, method decorators, runtime inspection, and browser cache policies.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/cache",
  },
  {
    name: "@xtaskjs/common",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Shared decorators and route metadata used across the xTaskjs runtime.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/common",
  },
  {
    name: "@xtaskjs/core",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Kernel, lifecycle, DI container, and application bootstrap primitives.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/core",
  },
  {
    name: "@xtaskjs/express-http",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Express adapter with template rendering and static file support.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/express-http",
  },
  {
    name: "@xtaskjs/fastify-http",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Fastify adapter for the same controller and lifecycle model.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/fastify-http",
  },
  {
    name: "@xtaskjs/internationalization",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Request-aware translations, locale fallback, namespace loading, and DI-friendly formatting services.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/internationalization",
  },
  {
    name: "@xtaskjs/mailer",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Mailer integration with named transports, template rendering, and DI-friendly delivery services.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/mailer",
  },
  {
    name: "@xtaskjs/queues",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Transport-agnostic queue handlers, broker helpers, publish decorators, and lifecycle-managed consumers.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/queues",
  },
  {
    name: "@xtaskjs/scheduler",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Cron, interval, and timeout decorators with lifecycle-managed job discovery and control.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/scheduler",
  },
  {
    name: "@xtaskjs/security",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Authentication, authorization decorators, and DI-aware security lifecycle.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/security",
  },
  {
    name: "@xtaskjs/typeorm",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "TypeORM integration with datasource lifecycle and repository helpers.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/typeorm",
  },
  {
    name: "@xtaskjs/value-objects",
    latestVersion: "Unavailable",
    publishedAt: null,
    publishedAtLabel: "npm data unavailable",
    description: "Value object primitives, conversion helpers, DTO decorators, and DI factory integration helpers.",
    npmUrl: "https://www.npmjs.com/package/@xtaskjs/value-objects",
  },
];

const toPublishedAtLabel = (value?: string): string => {
  if (!value) {
    return "Publication date unavailable";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Publication date unavailable";
  }

  return publishedAtFormatter.format(parsed);
};

@Service()
export class NpmPackageCatalogService {
  private cache: CachedCatalog | null = null;

  async listPublishedPackages(): Promise<readonly ProjectPackageViewModel[]> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.packages;
    }

    try {
      const response = await fetch(CATALOG_URL, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`npm registry request failed with ${response.status}`);
      }

      const payload = (await response.json()) as NpmSearchResponse;
      const packages = (payload.objects || [])
        .map((entry) => entry.package)
        .filter((pkg): pkg is NonNullable<NpmSearchResponse["objects"]>[number]["package"] & {
          name: string;
        } => Boolean(pkg?.name && pkg.name.startsWith("@xtaskjs/")))
        .map((pkg) => ({
          name: pkg.name,
          latestVersion: String(pkg.version || "Unknown"),
          publishedAt: pkg.date || null,
          publishedAtLabel: toPublishedAtLabel(pkg.date),
          description: String(pkg.description || "No description available on npm."),
          npmUrl: String(pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`),
        }))
        .sort((left, right) => left.name.localeCompare(right.name));

      const resolvedPackages = packages.length > 0 ? packages : fallbackPackages;
      this.cache = {
        expiresAt: now + CACHE_TTL_MS,
        packages: resolvedPackages,
      };
      return resolvedPackages;
    } catch {
      this.cache = {
        expiresAt: now + CACHE_TTL_MS,
        packages: fallbackPackages,
      };
      return fallbackPackages;
    }
  }
}
