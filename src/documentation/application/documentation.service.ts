import { Service } from "@xtaskjs/core";
import {
  InjectInternationalizationService,
  InternationalizationService,
} from "@xtaskjs/internationalization";
import {
  localizeDocumentationBase,
  localizeDecoratorGroups,
  localizeFlowSteps,
  localizeHighlights,
  localizePackageApiGroups,
  localizePackageDeepDive,
  localizePackageDocs,
  localizeSampleDocs,
} from "./documentation-localization";
import { generatedPackageApiGroups } from "./generated-package-api-groups";

type DocsPage = {
  readonly href: string;
  readonly label: string;
  readonly description: string;
  readonly isCurrent: boolean;
};

type DocsHighlight = {
  readonly title: string;
  readonly text: string;
};

type DocsFlowStep = {
  readonly title: string;
  readonly text: string;
};

type PackageCapabilityScore = {
  readonly label: string;
  readonly score: number;
};

type PackageDeepDiveDoc = {
  readonly runtimeChart: readonly PackageCapabilityScore[];
  readonly lifecycle: readonly DocsFlowStep[];
  readonly usage: readonly DocsFlowStep[];
  readonly related: readonly string[];
};

type PackageNavigationLink = {
  readonly name: string;
  readonly href: string;
};

type PackageSummaryCard = {
  readonly name: string;
  readonly path: string;
  readonly tagline: string;
  readonly href: string;
};

type PackageApiGroup = {
  readonly title: string;
  readonly sourcePath: string;
  readonly exports: readonly string[];
};

type PackageDoc = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly path: string;
  readonly tagline: string;
  readonly purpose: string;
  readonly install: string;
  readonly features: readonly string[];
  readonly integration: readonly string[];
  readonly sample: string;
  readonly exampleTitle: string;
  readonly exampleCode: string;
};

type SampleDoc = {
  readonly name: string;
  readonly folder: string;
  readonly stack: string;
  readonly summary: string;
  readonly endpoints: readonly string[];
  readonly flow: readonly string[];
};

type DecoratorDoc = {
  readonly id: string;
  readonly name: string;
  readonly packageName: string;
  readonly packagePath: string;
  readonly kind: string;
  readonly targets: string;
  readonly summary: string;
  readonly exampleTitle: string;
  readonly exampleCode: string;
};

type DecoratorGroupDoc = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly decorators: readonly DecoratorDoc[];
};

export type DocumentationViewModel = {
  readonly title: string;
  readonly repoUrl: string;
  readonly docsPages: readonly DocsPage[];
};

export type DocumentationHubViewModel = DocumentationViewModel & {
  readonly packageCount: number;
  readonly sampleCount: number;
  readonly decoratorCount: number;
  readonly highlights: readonly DocsHighlight[];
  readonly featuredPages: readonly DocsPage[];
  readonly quickStart: {
    readonly install: string;
    readonly bootstrap: string;
  };
};

export type DocumentationArchitectureViewModel = DocumentationViewModel & {
  readonly bootstrapFlow: readonly DocsFlowStep[];
  readonly requestFlow: readonly DocsFlowStep[];
  readonly securityFlow: readonly DocsFlowStep[];
  readonly quickStart: {
    readonly install: string;
    readonly bootstrap: string;
  };
};

export type DocumentationPackagesViewModel = DocumentationViewModel & {
  readonly packageCount: number;
  readonly packages: readonly PackageDoc[];
};

export type DocumentationPackageDetailViewModel = DocumentationViewModel & {
  readonly packageDoc: PackageDoc & PackageDeepDiveDoc;
  readonly packageRepoUrl: string;
  readonly sampleLinks: readonly PackageNavigationLink[];
  readonly relatedPackages: readonly PackageSummaryCard[];
  readonly apiGroups: readonly PackageApiGroup[];
};

export type DocumentationSamplesViewModel = DocumentationViewModel & {
  readonly sampleCount: number;
  readonly samples: readonly SampleDoc[];
};

export type DocumentationDecoratorsViewModel = DocumentationViewModel & {
  readonly decoratorCount: number;
  readonly decoratorGroupCount: number;
  readonly packageCoverage: readonly string[];
  readonly decoratorGroups: readonly DecoratorGroupDoc[];
};

const packageDocs: readonly PackageDoc[] = [
  {
    id: "package-core",
    slug: "core",
    name: "@xtaskjs/core",
    path: "packages/core",
    tagline: "Bootstrap, kernel, DI container, lifecycle, and HTTP application primitives.",
    purpose:
      "Core owns application startup. It boots the kernel, scans components, resolves adapters, and coordinates optional integrations like TypeORM and security during CreateApplication().",
    install: "npm install @xtaskjs/core reflect-metadata",
    features: [
      "CreateApplication() bootstraps lifecycle + kernel + adapter in one entry point.",
      "Container autoloads decorated classes and resolves constructor dependencies.",
      "ApplicationLifeCycle dispatches guards, pipes, middlewares, handlers, and lifecycle events.",
      "HTTP layer normalizes adapters and view results across node, Express, and Fastify.",
    ],
    integration: [
      "Works alone with the default node-http adapter.",
      "Delegates server integration to @xtaskjs/express-http or @xtaskjs/fastify-http.",
      "Initializes @xtaskjs/typeorm and @xtaskjs/security when those packages are present.",
    ],
    sample: "01-new_app, 02-express_app, 03-fastify_app, 04-typeorm_app, 06-security_app, 07-security_express_app",
    exampleTitle: "Minimal application bootstrap",
    exampleCode: [
      'import "reflect-metadata";',
      'import { CreateApplication } from "@xtaskjs/core";',
      "",
      "async function main() {",
      "  await CreateApplication({",
      '    adapter: "node-http",',
      "    autoListen: true,",
      '    server: { host: "127.0.0.1", port: 3000 },',
      "  });",
      "}",
      "",
      "main().catch(console.error);",
    ].join("\n"),
  },
  {
    id: "package-common",
    slug: "common",
    name: "@xtaskjs/common",
    path: "packages/common",
    tagline: "Cross-package decorators, route metadata, logger, and shared execution types.",
    purpose:
      "Common provides the public decorator surface for controllers and route pipelines. It is the language the rest of the framework uses to express middleware, guard, and event metadata.",
    install: "npm install @xtaskjs/common reflect-metadata",
    features: [
      "Controller, Get, Post, Patch, Delete decorators describe routes.",
      "UseGuards, UseMiddlewares, and UsePipes compose route execution order.",
      "Logger and route metadata types are shared by framework packages.",
      "Lifecycle metadata drives runners and OnEvent listeners.",
    ],
    integration: [
      "Consumed by @xtaskjs/core during route registration and execution.",
      "Extended by @xtaskjs/security through additional decorators and guards.",
    ],
    sample: "All samples use controller decorators from @xtaskjs/common.",
    exampleTitle: "Controller metadata and pipeline composition",
    exampleCode: [
      'import { Controller, Get, Post, UseGuards } from "@xtaskjs/common";',
      "",
      '@Controller("/users")',
      '@UseGuards((context) => Boolean(context))',
      "export class UsersController {",
      '  @Get("/")',
      "  list() {",
      "    return [];",
      "  }",
      "",
      '  @Post("/")',
      "  create() {",
      "    return { created: true };",
      "  }",
      "}",
    ].join("\n"),
  },
  {
    id: "package-express",
    slug: "express-http",
    name: "@xtaskjs/express-http",
    path: "packages/express-http",
    tagline: "Express adapter with static assets and template engine integration.",
    purpose:
      "The Express adapter translates framework routes into Express request handling. It adds static files, template engines, and JSON or rendered-view responses without changing controller code.",
    install: "npm install @xtaskjs/express-http express reflect-metadata",
    features: [
      "Wraps an existing Express application instance.",
      "Supports native Express view engines such as Handlebars.",
      "Serves static assets and rendered templates from configurable folders.",
      "Uses the same controller contracts as node-http and Fastify.",
    ],
    integration: [
      "Selected explicitly with new ExpressAdapter(expressApp).",
      "Pairs naturally with view(...) return values from controllers.",
      "Used by the current xtaskjs.io site and the 07-security_express_app sample.",
    ],
    sample: "02-express_app and 07-security_express_app",
    exampleTitle: "Express bootstrap with templates",
    exampleCode: [
      'import express from "express";',
      'import { CreateApplication } from "@xtaskjs/core";',
      'import { ExpressAdapter } from "@xtaskjs/express-http";',
      "",
      "const expressApp = express();",
      "expressApp.use(express.json());",
      "",
      "await CreateApplication({",
      "  adapter: new ExpressAdapter(expressApp),",
      "  autoListen: true,",
      '  server: { host: "127.0.0.1", port: 3000 },',
      "});",
    ].join("\n"),
  },
  {
    id: "package-fastify",
    slug: "fastify-http",
    name: "@xtaskjs/fastify-http",
    path: "packages/fastify-http",
    tagline: "Fastify adapter for the same controller model used by core and Express.",
    purpose:
      "Fastify support mirrors Express support but keeps Fastify-specific serving, view rendering, and static file behavior behind the same framework contracts.",
    install: "npm install @xtaskjs/fastify-http fastify reflect-metadata",
    features: [
      "Wraps a Fastify instance and exposes the shared xtask HTTP adapter contract.",
      "Supports static assets and file-template rendering.",
      "Preserves controller portability between Express and Fastify.",
      "Backs both pure Fastify and Fastify + TypeORM samples.",
    ],
    integration: [
      "Selected explicitly with new FastifyAdapter(fastifyApp).",
      "Good fit when you want Fastify performance but keep xtask decorators and DI.",
    ],
    sample: "03-fastify_app and 04-typeorm_app",
    exampleTitle: "Fastify bootstrap",
    exampleCode: [
      'import fastify from "fastify";',
      'import { CreateApplication } from "@xtaskjs/core";',
      'import { FastifyAdapter } from "@xtaskjs/fastify-http";',
      "",
      "const fastifyApp = fastify({ logger: true });",
      "",
      "await CreateApplication({",
      "  adapter: new FastifyAdapter(fastifyApp),",
      "  autoListen: true,",
      '  server: { host: "127.0.0.1", port: 3000 },',
      "});",
    ].join("\n"),
  },
  {
    id: "package-typeorm",
    slug: "typeorm",
    name: "@xtaskjs/typeorm",
    path: "packages/typeorm",
    tagline: "TypeORM integration, datasource registration, and repository injection helpers.",
    purpose:
      "TypeORM support attaches datasource lifecycle to xtask startup and shutdown. It gives the container a standard way to inject datasources and repositories while re-exporting the TypeORM surface.",
    install: "npm install @xtaskjs/typeorm typeorm reflect-metadata",
    features: [
      "Registers datasources during bootstrap and destroys them during app.close().",
      "Re-exports TypeORM decorators and APIs from one package entry point.",
      "Supports datasource decorators and injection helpers.",
      "Fits both SQLite demos and larger multi-datasource applications.",
    ],
    integration: [
      "Activated automatically when the package exports initializeTypeOrmIntegration().",
      "Used with Fastify in the SQLite sample and with Postgres in this website project.",
    ],
    sample: "04-typeorm_app",
    exampleTitle: "Datasource registration",
    exampleCode: [
      'import { TypeOrmDataSource } from "@xtaskjs/typeorm";',
      'import { UserEntity } from "./user.entity";',
      "",
      "@TypeOrmDataSource({",
      '  name: "default",',
      '  type: "sqlite",',
      '  database: process.env.DB_PATH || "xtask-typeorm.sqlite",',
      "  entities: [UserEntity],",
      "  synchronize: true,",
      "})",
      "export class DatabaseConfig {}",
    ].join("\n"),
  },
  {
    id: "package-security",
    slug: "security",
    name: "@xtaskjs/security",
    path: "packages/security",
    tagline: "JWT and JWE authentication, authorization decorators, and DI-aware security lifecycle.",
    purpose:
      "Security builds on the core route pipeline. It registers strategies, authenticates requests through Passport-compatible flows, and injects auth state into route execution context for guards and controllers.",
    install: "npm install @xtaskjs/security passport passport-jwt reflect-metadata",
    features: [
      "registerJwtStrategy() and registerJweStrategy() define authentication entry points.",
      "Authenticated, Auth, Roles, and AllowAnonymous decorate public or protected routes.",
      "SecurityAuthenticationService and SecurityAuthorizationService are injected through the container.",
      "Lifecycle integration is automatic when CreateApplication() sees the package.",
    ],
    integration: [
      "Depends on @xtaskjs/core and @xtaskjs/common route metadata.",
      "Used in node-http and Express security samples, and in this admin session implementation.",
    ],
    sample: "06-security_app and 07-security_express_app",
    exampleTitle: "JWT strategy plus protected controller",
    exampleCode: [
      'import { Controller, Get } from "@xtaskjs/common";',
      'import { Authenticated, Roles, registerJwtStrategy } from "@xtaskjs/security";',
      "",
      "registerJwtStrategy({",
      '  name: "default",',
      "  default: true,",
      '  secretOrKey: process.env.JWT_SECRET,',
      "});",
      "",
      '@Controller("/admin")',
      '@Authenticated()',
      "export class AdminController {",
      '  @Get("/")',
      '  @Roles("admin")',
      "  dashboard(req: any) {",
      '    return { user: req.user.sub, roles: req.auth.roles };',
      "  }",
      "}",
    ].join("\n"),
  },
  {
    id: "package-mailer",
    slug: "mailer",
    name: "@xtaskjs/mailer",
    path: "packages/mailer",
    tagline: "Nodemailer-backed delivery, template rendering, named transports, and DI-friendly mail services.",
    purpose:
      "Mailer integrates outbound email into the same xtask lifecycle used by controllers and persistence. It registers transports at startup, exposes injectable mail services and transporters, and supports inline, EJS, or Handlebars-backed templates.",
    install: "npm install @xtaskjs/mailer nodemailer reflect-metadata",
    features: [
      "registerMailerTransport() supports SMTP, Mailtrap, JSON transport, stream transport, and custom transporter factories.",
      "MailerService can send raw mail, render templates, and deliver template-driven messages.",
      "registerMailerTemplate(), registerEjsTemplateRenderer(), and registerHandlebarsTemplateRenderer() support reusable email views.",
      "InjectMailerService(), InjectMailerTransport(), and InjectMailerLifecycleManager() connect delivery into DI-managed services.",
    ],
    integration: [
      "Initialized automatically by @xtaskjs/core when the package is installed.",
      "Used directly in the 08-email_express_app sample and in 07-security_express_app for protected profile notifications.",
      "Works well beside security when mail actions should happen after authenticated requests.",
    ],
    sample: "07-security_express_app and 08-email_express_app",
    exampleTitle: "Named transports plus template-driven delivery",
    exampleCode: [
      'import { Service } from "@xtaskjs/core";',
      'import {',
      '  InjectMailerService,',
      '  MailerService,',
      '  createMailtrapTransportOptions,',
      '  registerMailerTemplate,',
      '  registerMailerTransport,',
      '} from "@xtaskjs/mailer";',
      "",
      "registerMailerTransport({",
      '  name: "default",',
      '  defaults: { from: "hello@xtaskjs.dev" },',
      "  transport: createMailtrapTransportOptions({",
      '    username: process.env.MAILTRAP_SMTP_USER || "user",',
      '    password: process.env.MAILTRAP_SMTP_PASS || "pass",',
      "  }),",
      "  verifyOnStart: false,",
      "});",
      "",
      "registerMailerTemplate({",
      '  name: "welcome-email",',
      '  subject: "Welcome {{user.name}}",',
      '  text: "Hello {{user.name}}",',
      '  html: "<h1>Hello {{user.name}}</h1>",',
      "});",
      "",
      "@Service()",
      "export class WelcomeMailerService {",
      "  constructor(",
      "    @InjectMailerService()",
      "    private readonly mailer: MailerService",
      "  ) {}",
      "",
      "  async sendWelcome(to: string) {",
      '    return this.mailer.sendTemplate("welcome-email", { user: { name: "Ada" } }, {',
      "      message: { to },",
      "    });",
      "  }",
      "}",
    ].join("\n"),
  },
  {
    id: "package-internationalization",
    slug: "internationalization",
    name: "@xtaskjs/internationalization",
    path: "packages/internationalization",
    tagline: "Request-aware translations, locale fallback, namespace loading, and DI-friendly formatting services.",
    purpose:
      "Internationalization adds request-scoped locale resolution, translation lookup, pluralization, and formatting helpers to the xtask lifecycle. It registers locale services before controllers resolve and exposes an injectable service for controllers, views, and domain presenters.",
    install: "npm install @xtaskjs/internationalization reflect-metadata",
    features: [
      "Request-aware translations with locale fallback and exact-count pluralization.",
      "Async namespace loading for feature-specific translation bundles.",
      "Built-in number, currency, date, and datetime formatting with optional custom formatters.",
      "InjectInternationalizationService() exposes locale-aware translation and formatting inside DI-managed classes.",
    ],
    integration: [
      "Initializes automatically before container lifecycle listeners are resolved during CreateApplication().",
      "Resolves locale from query parameters and request headers, and can be extended with custom resolvers.",
      "Used by this website and by the 09-internationalization_app and 10-internationalization_express_app samples.",
    ],
    sample: "09-internationalization_app and 10-internationalization_express_app",
    exampleTitle: "Locale registration plus injected translations",
    exampleCode: [
      'import { Service } from "@xtaskjs/core";',
      'import {',
      '  InjectInternationalizationService,',
      '  InternationalizationService,',
      '  configureInternationalization,',
      '  registerInternationalizationLocale,',
      '} from "@xtaskjs/internationalization";',
      "",
      "configureInternationalization({",
      '  defaultLocale: "en-US",',
      '  fallbackLocale: "en-US",',
      "});",
      "",
      "registerInternationalizationLocale({",
      '  locale: "en-US",',
      '  translations: { checkout: { total: "Total: {{amount, currency}}" } },',
      "});",
      "",
      "@Service()",
      "export class CheckoutPresenter {",
      "  constructor(",
      "    @InjectInternationalizationService()",
      "    private readonly intl: InternationalizationService",
      "  ) {}",
      "",
      "  presentTotal(amount: number) {",
      '    return this.intl.t("checkout.total", { params: { amount } });',
      "  }",
      "}",
    ].join("\n"),
  },
  {
    id: "package-scheduler",
    slug: "scheduler",
    name: "@xtaskjs/scheduler",
    path: "packages/scheduler",
    tagline: "Cron, interval, and timeout decorators with lifecycle-managed job discovery and control.",
    purpose:
      "Scheduler adds recurring and delayed jobs to xtask services. It discovers decorated methods after the DI container is ready, runs boot jobs during initialization, starts recurring work on lifecycle ready, and exposes service APIs for inspection and manual execution.",
    install: "npm install @xtaskjs/scheduler node-cron reflect-metadata",
    features: [
      "Cron(), Every(), Interval(), and Timeout() decorators declare scheduled jobs on services.",
      "Supports runOnBoot, runOnInit, named groups, retries, and per-job retry or error hooks.",
      "SchedulerService lists jobs and groups, and can start, stop, or run them manually.",
      "Tracks runtime state such as run counts, failures, and the last execution error.",
    ],
    integration: [
      "Discovered automatically during CreateApplication() after the container has registered providers.",
      "Starts recurring jobs on lifecycle ready and stops active handles during app.close().",
      "Demonstrated by the 11-scheduler_app sample with inspection endpoints and maintenance groups.",
    ],
    sample: "11-scheduler_app",
    exampleTitle: "Scheduled jobs with grouped execution",
    exampleCode: [
      'import { Service } from "@xtaskjs/core";',
      'import { Cron, InjectSchedulerService, SchedulerService, Timeout } from "@xtaskjs/scheduler";',
      "",
      "@Service()",
      "export class ReportsScheduler {",
      "  constructor(",
      "    @InjectSchedulerService()",
      "    private readonly scheduler: SchedulerService",
      "  ) {}",
      "",
      '  @Cron("0 */5 * * * *", { name: "reports.flush", group: "reports", runOnBoot: true })',
      "  flushReports() {",
      '    console.log("flush pending reports");',
      "  }",
      "",
      '  @Timeout("30s", { name: "reports.warmup" })',
      "  warmup() {",
      '    console.log("warm cache once after startup");',
      "  }",
      "",
      "  async rerunReports() {",
      '    await this.scheduler.runGroup("reports");',
      "  }",
      "}",
    ].join("\n"),
  },
];

const sampleDocs: readonly SampleDoc[] = [
  {
    name: "01-new_app",
    folder: "samples/01-new_app",
    stack: "node-http + core",
    summary: "Smallest possible application. It proves that core can boot a server and route a health endpoint with no external adapter.",
    endpoints: ["GET /health"],
    flow: [
      "Install dependencies inside the sample folder.",
      "Run npm start to boot CreateApplication() with node-http.",
      "Call /health to verify controller registration and logger wiring.",
    ],
  },
  {
    name: "02-express_app",
    folder: "samples/02-express_app",
    stack: "core + express-http",
    summary: "Shows how an existing Express app is wrapped by ExpressAdapter while controllers still return framework-native values.",
    endpoints: ["GET /", "GET /health"],
    flow: [
      "Create an Express instance and enable body parsing or other middleware yourself.",
      "Pass the instance into new ExpressAdapter(expressApp).",
      "Render a template-backed home page and expose a JSON health endpoint.",
    ],
  },
  {
    name: "03-fastify_app",
    folder: "samples/03-fastify_app",
    stack: "core + fastify-http",
    summary: "Demonstrates adapter portability: the same controller style runs on Fastify without changing business logic.",
    endpoints: ["GET /", "GET /health"],
    flow: [
      "Create a Fastify instance with its own logger/runtime options.",
      "Wrap it with FastifyAdapter.",
      "Reuse the same controller conventions used by Express and node-http.",
    ],
  },
  {
    name: "04-typeorm_app",
    folder: "samples/04-typeorm_app",
    stack: "fastify-http + typeorm",
    summary: "Adds persistent state on top of the Fastify adapter. The sample seeds users and demonstrates datasource lifecycle registration.",
    endpoints: ["GET /users/", "POST /users/seed", "GET /health/"],
    flow: [
      "Decorate a datasource configuration class with TypeOrmDataSource().",
      "Boot the app with FastifyAdapter.",
      "Use injected repositories or datasources inside services to query and mutate state.",
    ],
  },
  {
    name: "06-security_app",
    folder: "samples/06-security_app",
    stack: "node-http + security",
    summary: "Demonstrates JWT and JWE flows without a full web framework adapter, focusing on strategy registration and protected controllers.",
    endpoints: [
      "GET /health/",
      "GET /auth/jwt/admin",
      "GET /me/",
      "GET /admin/",
      "GET /encrypted/",
    ],
    flow: [
      "Register JWT and JWE strategies before CreateApplication().",
      "Issue a demo token from /auth/jwt/admin.",
      "Use Authorization: Bearer <token> against /me/ and /admin/.",
    ],
  },
  {
    name: "07-security_express_app",
    folder: "samples/07-security_express_app",
    stack: "express-http + security + mailer",
    summary: "Combines Express integration with security decorators and the mailer module, showing authenticated profile endpoints plus protected transactional and notification emails.",
    endpoints: [
      "GET /health/",
      "GET /auth/jwt/admin",
      "GET /me/",
      "POST /me/notify",
      "GET /admin/",
      "GET /encrypted/",
    ],
    flow: [
      "Create an Express app, register JWT and JWE strategies, then register mail transports and templates at startup.",
      "Fetch a demo token from /auth/jwt/admin and call /me/ with Authorization: Bearer <token>.",
      "POST to /me/notify to render profile email templates and deliver through the default and notifications transports.",
    ],
  },
  {
    name: "08-email_express_app",
    folder: "samples/08-email_express_app",
    stack: "express-http + mailer",
    summary: "Dedicated mailer sample showing named transports, EJS-backed email templates, and DI-managed services that send welcome and campaign messages.",
    endpoints: ["GET /health/", "GET /email/", "POST /email/welcome", "POST /email/campaign"],
    flow: [
      "Register the default and notifications transports, then attach the ejs-file renderer and email templates.",
      "Start the Express app through CreateApplication() and inspect /email/ for the sample contract.",
      "POST to /email/welcome or /email/campaign to render templates and send through the configured transporter.",
    ],
  },
  {
    name: "09-internationalization_app",
    folder: "samples/09-internationalization_app",
    stack: "node-http + internationalization",
    summary: "Shows request-scoped locale resolution, translation helpers, custom formatters, and lazy namespace loading on the default node-http adapter.",
    endpoints: [
      "GET /health",
      "GET /i18n",
      "GET /i18n?locale=es-ES&name=ada&items=3&amount=1499.95",
      "GET /i18n/checkout?locale=en-US&items=2&amount=249.5",
    ],
    flow: [
      "Configure default locale, fallback locale, and built-in formatters before CreateApplication().",
      "Open /i18n to inspect translated messages, locale state, and loaded namespaces.",
      "Hit /i18n/checkout to trigger lazy namespace loading and localized number, currency, and datetime formatting.",
    ],
  },
  {
    name: "10-internationalization_express_app",
    folder: "samples/10-internationalization_express_app",
    stack: "express-http + internationalization",
    summary: "Combines localized page rendering with the Express adapter, including query-driven locale switching, Accept-Language support, and lazy checkout translations.",
    endpoints: [
      "GET /?locale=en-US&name=ada&items=3&amount=1499.95",
      "GET /?locale=es-ES&name=ada&items=3&amount=1499.95",
      "GET /checkout?locale=es-ES&name=ada&items=2&amount=249.5",
      "GET /health",
    ],
    flow: [
      "Configure locale catalogs and custom formatters, then boot an Express app through ExpressAdapter.",
      "Open the localized home page and switch between en-US and es-ES through query parameters or Accept-Language.",
      "Follow the checkout route to exercise lazy namespace loading with server-rendered views.",
    ],
  },
  {
    name: "11-scheduler_app",
    folder: "samples/11-scheduler_app",
    stack: "node-http + scheduler",
    summary: "Demonstrates scheduled jobs integrated with xtask lifecycle, including boot execution, named groups, retries, and runtime inspection endpoints.",
    endpoints: [
      "GET /health",
      "GET /scheduler/status",
      "GET /scheduler/groups",
      "GET /scheduler/run-maintenance",
    ],
    flow: [
      "Start the sample to let CreateApplication() discover scheduled methods after the container boots.",
      "Open /scheduler/status to inspect job metadata, counters, failures, and recent events.",
      "Call /scheduler/run-maintenance to trigger a named job group manually and observe retry behavior.",
    ],
  },
];

const packageDeepDiveDocs: Readonly<Record<string, PackageDeepDiveDoc>> = {
  core: {
    runtimeChart: [
      { label: "Bootstrap", score: 5 },
      { label: "Dependency Injection", score: 5 },
      { label: "HTTP Delivery", score: 5 },
      { label: "Rendering", score: 4 },
      { label: "Integrations", score: 5 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Import reflect-metadata and decorate controllers, services, and runners so the kernel can discover them during bootstrap.",
      },
      {
        title: "During CreateApplication()",
        text: "Core builds the application lifecycle, selects the HTTP adapter, loads the DI container, and initializes optional integrations such as TypeORM, security, mailer, scheduler, and internationalization.",
      },
      {
        title: "During app.close()",
        text: "Core emits shutdown lifecycle events, closes the active adapter, and asks installed integrations to release resources in a predictable order.",
      },
    ],
    usage: [
      {
        title: "1. Install and import",
        text: "Install @xtaskjs/core with reflect-metadata and use CreateApplication() as the single bootstrap entry point.",
      },
      {
        title: "2. Pick an adapter",
        text: "Start with node-http for the smallest runtime, or pair core with Express or Fastify adapters when you need ecosystem-specific middleware or rendering.",
      },
      {
        title: "3. Layer integrations later",
        text: "Add persistence, security, mail, localization, or scheduled jobs without changing the controller and DI patterns you started with.",
      },
    ],
    related: ["common", "express-http", "fastify-http"],
  },
  common: {
    runtimeChart: [
      { label: "Bootstrap", score: 3 },
      { label: "Dependency Injection", score: 4 },
      { label: "HTTP Delivery", score: 5 },
      { label: "Security", score: 3 },
      { label: "Integrations", score: 4 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Common decorators attach route, guard, middleware, pipe, and lifecycle metadata while modules are imported.",
      },
      {
        title: "During CreateApplication()",
        text: "Core reads the metadata from @xtaskjs/common to register controller routes, lifecycle listeners, and execution pipelines.",
      },
      {
        title: "During app.close()",
        text: "Common itself does not hold resources, but its lifecycle metadata continues to shape how shutdown listeners run.",
      },
    ],
    usage: [
      {
        title: "1. Define controllers",
        text: "Use Controller, Get, Post, Patch, and Delete to describe the public HTTP surface of your application.",
      },
      {
        title: "2. Compose the pipeline",
        text: "Attach UseGuards, UseMiddlewares, and UsePipes to keep authentication, cross-cutting logic, and validation close to the route.",
      },
      {
        title: "3. Add lifecycle hooks",
        text: "Use ApplicationRunner, CommandLineRunner, and OnEvent when startup work or runtime events should be expressed with the same decorator-first model.",
      },
    ],
    related: ["core", "security", "typeorm"],
  },
  "express-http": {
    runtimeChart: [
      { label: "Bootstrap", score: 3 },
      { label: "HTTP Delivery", score: 5 },
      { label: "Rendering", score: 5 },
      { label: "Integrations", score: 4 },
      { label: "Messaging", score: 3 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Create an Express app, register its middleware stack, and optionally configure template engines or static asset behavior.",
      },
      {
        title: "During CreateApplication()",
        text: "The Express adapter maps xtaskjs routes into Express handlers and preserves view(), JSON, and status-code responses.",
      },
      {
        title: "During app.close()",
        text: "The xtask application stops the active server while your existing Express middleware and configuration remain the same application-wide boundary.",
      },
    ],
    usage: [
      {
        title: "1. Create the Express app",
        text: "Enable JSON parsing, cookies, sessions, or any other Express middleware before handing control to xtaskjs.",
      },
      {
        title: "2. Pass the adapter",
        text: "Wrap the instance with new ExpressAdapter(expressApp) and pass it into CreateApplication().",
      },
      {
        title: "3. Return framework-native results",
        text: "Keep controllers portable by returning plain objects or view() results while the adapter handles Express-specific rendering details.",
      },
    ],
    related: ["core", "mailer", "internationalization"],
  },
  "fastify-http": {
    runtimeChart: [
      { label: "Bootstrap", score: 3 },
      { label: "HTTP Delivery", score: 5 },
      { label: "Rendering", score: 4 },
      { label: "Integrations", score: 4 },
      { label: "Performance", score: 5 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Create a Fastify instance with your preferred logger and plugins before wiring it into the framework adapter.",
      },
      {
        title: "During CreateApplication()",
        text: "The Fastify adapter translates the shared xtaskjs controller contract into Fastify routes, static assets, and template lookups.",
      },
      {
        title: "During app.close()",
        text: "Shutdown flows through the application close sequence so Fastify resources stop together with the rest of the xtask lifecycle.",
      },
    ],
    usage: [
      {
        title: "1. Create the Fastify app",
        text: "Start from a Fastify instance when you want lower-level performance tuning or plugin-driven composition.",
      },
      {
        title: "2. Wrap it with the adapter",
        text: "Pass new FastifyAdapter(fastifyApp) into CreateApplication() to keep the same controller surface used by node-http and Express.",
      },
      {
        title: "3. Add persistence or views",
        text: "Pair the adapter with TypeORM or file-backed views without rewriting route handlers or service classes.",
      },
    ],
    related: ["core", "typeorm", "common"],
  },
  typeorm: {
    runtimeChart: [
      { label: "Bootstrap", score: 4 },
      { label: "Dependency Injection", score: 4 },
      { label: "Persistence", score: 5 },
      { label: "Integrations", score: 5 },
      { label: "Security", score: 2 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Register datasources with registerTypeOrmDataSource() or TypeOrmDataSource() so xtaskjs knows what to initialize.",
      },
      {
        title: "During CreateApplication()",
        text: "The integration opens datasources, publishes repository and datasource tokens into the container, and makes them injectable to services and controllers.",
      },
      {
        title: "During app.close()",
        text: "Datasource connections are destroyed automatically so database shutdown is aligned with the main application lifecycle.",
      },
    ],
    usage: [
      {
        title: "1. Register datasource definitions",
        text: "Describe your datasource once and keep entities, migrations, and connection details close to the app entry point.",
      },
      {
        title: "2. Inject repositories or datasources",
        text: "Use the xtask TypeORM decorators and tokens to inject repositories into DI-managed services instead of constructing them manually.",
      },
      {
        title: "3. Let lifecycle manage connections",
        text: "Rely on bootstrap and shutdown hooks instead of manual initialize() and destroy() calls across the codebase.",
      },
    ],
    related: ["core", "common", "security"],
  },
  security: {
    runtimeChart: [
      { label: "Bootstrap", score: 4 },
      { label: "Dependency Injection", score: 4 },
      { label: "Security", score: 5 },
      { label: "HTTP Delivery", score: 3 },
      { label: "Integrations", score: 4 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Register JWT or JWE strategies and decorate protected controllers so the framework knows what authentication surface to publish.",
      },
      {
        title: "During CreateApplication()",
        text: "Security initializes authentication and authorization services, wires Passport-compatible flows, and exposes auth context to the route pipeline.",
      },
      {
        title: "During app.close()",
        text: "The security lifecycle manager tears down its state together with the rest of the application runtime.",
      },
    ],
    usage: [
      {
        title: "1. Register strategies",
        text: "Call registerJwtStrategy() or registerJweStrategy() before startup, or use their decorator forms in configuration modules.",
      },
      {
        title: "2. Protect routes declaratively",
        text: "Apply Authenticated, Roles, Auth, or AllowAnonymous to controllers and route handlers instead of embedding auth checks in business logic.",
      },
      {
        title: "3. Inject security services when needed",
        text: "For advanced flows, inject the authentication, authorization, or lifecycle services from the DI container.",
      },
    ],
    related: ["core", "common", "mailer"],
  },
  mailer: {
    runtimeChart: [
      { label: "Bootstrap", score: 4 },
      { label: "Dependency Injection", score: 4 },
      { label: "Messaging", score: 5 },
      { label: "Rendering", score: 4 },
      { label: "Integrations", score: 4 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Register transports, template renderers, and reusable templates while modules load so the mail catalog is ready before requests arrive.",
      },
      {
        title: "During CreateApplication()",
        text: "The mailer lifecycle publishes MailerService, named transporters, and optional startup verification into the DI container.",
      },
      {
        title: "During app.close()",
        text: "Transports marked for shutdown are closed automatically so SMTP or test transports do not leak resources.",
      },
    ],
    usage: [
      {
        title: "1. Register one or more transports",
        text: "Start with a default transport, then add named channels like notifications when internal and external emails should be separated.",
      },
      {
        title: "2. Define templates and renderers",
        text: "Choose inline templates or file-backed EJS or Handlebars renderers based on how much reuse or designer collaboration you need.",
      },
      {
        title: "3. Inject MailerService into services",
        text: "Send template-driven messages from DI-managed application services instead of scattering transport code across controllers.",
      },
    ],
    related: ["core", "express-http", "security"],
  },
  internationalization: {
    runtimeChart: [
      { label: "Bootstrap", score: 4 },
      { label: "Dependency Injection", score: 4 },
      { label: "Localization", score: 5 },
      { label: "Rendering", score: 4 },
      { label: "HTTP Delivery", score: 3 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Register locales, formatters, fallback settings, and optional locale resolvers so translation rules are known before request handling starts.",
      },
      {
        title: "During CreateApplication()",
        text: "Internationalization initializes request-aware locale services before controllers and views are resolved, enabling injected translations and formatting from the first request.",
      },
      {
        title: "During app.close()",
        text: "The lifecycle manager releases runtime translation state together with the rest of the application services.",
      },
    ],
    usage: [
      {
        title: "1. Configure locales and fallbacks",
        text: "Register your locale catalogs, default locale, fallback locale, and any custom formatters during startup.",
      },
      {
        title: "2. Resolve locale from the request",
        text: "Use query parameters, Accept-Language, cookies, or custom resolvers to make the current locale part of request context.",
      },
      {
        title: "3. Inject translations into pages and services",
        text: "Call the injected service inside controllers, views, presenters, and domain helpers so all formatting stays consistent.",
      },
    ],
    related: ["core", "common", "express-http"],
  },
  scheduler: {
    runtimeChart: [
      { label: "Bootstrap", score: 4 },
      { label: "Dependency Injection", score: 4 },
      { label: "Scheduling", score: 5 },
      { label: "Operations", score: 5 },
      { label: "Integrations", score: 4 },
    ],
    lifecycle: [
      {
        title: "Before startup",
        text: "Decorate service methods with Cron, Every, Interval, or Timeout so the scheduler can discover jobs from the DI container.",
      },
      {
        title: "During CreateApplication()",
        text: "Scheduler discovery runs after the container is ready, wiring jobs into lifecycle phases and enabling boot-time execution or grouped control.",
      },
      {
        title: "During app.close()",
        text: "Recurring timers and cron handles are stopped automatically so background work does not outlive the application process.",
      },
    ],
    usage: [
      {
        title: "1. Decorate job methods",
        text: "Choose Cron for calendar schedules, Every or Interval for repeated delays, and Timeout for one-shot post-startup work.",
      },
      {
        title: "2. Organize jobs with options",
        text: "Use names, groups, retries, timezone overrides, and runOnBoot or runOnInit to reflect operational intent in code.",
      },
      {
        title: "3. Inspect and trigger jobs at runtime",
        text: "Inject SchedulerService when operators or diagnostics endpoints need to list jobs, run one immediately, or rerun a whole group.",
      },
    ],
    related: ["core", "common", "security"],
  },
};

const decoratorGroups: readonly DecoratorGroupDoc[] = [
  {
    id: "decorators-http",
    title: "HTTP Routing And Pipelines",
    description:
      "Route declaration and request-pipeline decorators exported by @xtaskjs/common. These are the core HTTP building blocks used by controllers in every sample.",
    decorators: [
      {
        id: "decorator-common-controller",
        name: "Controller",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Defines the base route path for an HTTP controller and can attach shared middlewares, guards, and pipes.",
        exampleTitle: "Route prefix on a controller",
        exampleCode: [
          'import { Controller, Get } from "@xtaskjs/common";',
          "",
          '@Controller("/users")',
          "export class UsersController {",
          '  @Get("/")',
          "  list() {",
          "    return [];",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-get",
        name: "Get",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a GET route handler and optionally adds route-specific middleware, guards, or pipes.",
        exampleTitle: "GET route",
        exampleCode: [
          'import { Controller, Get } from "@xtaskjs/common";',
          "",
          '@Controller("/health")',
          "export class HealthController {",
          '  @Get("/")',
          "  status() {",
          "    return { ok: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-post",
        name: "Post",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a POST route handler for commands, form submissions, or resource creation.",
        exampleTitle: "POST route",
        exampleCode: [
          'import { Controller, Post } from "@xtaskjs/common";',
          "",
          '@Controller("/users")',
          "export class UsersController {",
          '  @Post("/")',
          "  create(req: any) {",
          "    return { email: req.body.email, created: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-patch",
        name: "Patch",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a PATCH route handler for partial updates.",
        exampleTitle: "PATCH route",
        exampleCode: [
          'import { Controller, Patch } from "@xtaskjs/common";',
          "",
          '@Controller("/users")',
          "export class UsersController {",
          '  @Patch("/:id")',
          "  update(req: any) {",
          "    return { id: req.params.id, updated: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-delete",
        name: "Delete",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a DELETE route handler for removals and destructive operations.",
        exampleTitle: "DELETE route",
        exampleCode: [
          'import { Controller, Delete } from "@xtaskjs/common";',
          "",
          '@Controller("/users")',
          "export class UsersController {",
          '  @Delete("/:id")',
          "  remove(req: any) {",
          "    return { id: req.params.id, removed: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-usemiddlewares",
        name: "UseMiddlewares",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Class and method decorator",
        targets: "class or method",
        summary: "Adds one or more middlewares to a controller or route so cross-cutting logic runs before the handler.",
        exampleTitle: "Class-level middleware",
        exampleCode: [
          'import { Controller, Get, UseMiddlewares } from "@xtaskjs/common";',
          "",
          "const requestLogger = async (_context: any, next: () => Promise<void>) => {",
          "  await next();",
          "};",
          "",
          '@Controller("/audit")',
          "@UseMiddlewares(requestLogger)",
          "export class AuditController {",
          '  @Get("/")',
          "  list() {",
          "    return { ok: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-useguards",
        name: "UseGuards",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Class and method decorator",
        targets: "class or method",
        summary: "Attaches guard functions to a controller or route to allow, deny, or enrich request context before execution.",
        exampleTitle: "Route-level guard",
        exampleCode: [
          'import { Controller, Get, UseGuards } from "@xtaskjs/common";',
          "",
          'const adminGuard = (context: any) => context.request?.headers?.["x-role"] === "admin";',
          "",
          '@Controller("/admin")',
          "export class AdminController {",
          '  @Get("/")',
          "  @UseGuards(adminGuard)",
          "  dashboard() {",
          "    return { secure: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-usepipes",
        name: "UsePipes",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/controller.ts",
        kind: "Class and method decorator",
        targets: "class or method",
        summary: "Applies argument transformation or validation functions before a route handler consumes input.",
        exampleTitle: "Pipe-based payload cleanup",
        exampleCode: [
          'import { Controller, Post, UsePipes } from "@xtaskjs/common";',
          "",
          'const trimEmailPipe = (value: any) => ({ ...value, email: String(value.email || "").trim() });',
          "",
          '@Controller("/accounts")',
          "export class AccountController {",
          '  @Post("/")',
          "  @UsePipes(trimEmailPipe)",
          "  create(req: any) {",
          "    return req.body;",
          "  }",
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    id: "decorators-lifecycle",
    title: "Lifecycle Runners And Events",
    description:
      "Lifecycle decorators from @xtaskjs/common used to run startup logic, CLI tasks, and event handlers inside the application lifecycle.",
    decorators: [
      {
        id: "decorator-common-onevent",
        name: "OnEvent",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/onevent.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a lifecycle event handler for a given phase and execution priority.",
        exampleTitle: "Lifecycle phase listener",
        exampleCode: [
          'import { OnEvent } from "@xtaskjs/common";',
          "",
          "export class AuditListener {",
          '  @OnEvent("AFTER_CONTROLLER_HANDLER", 10)',
          "  afterHandler() {",
          '    console.log("controller completed");',
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-applicationrunner",
        name: "ApplicationRunner",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/applicationrunner.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Runs a method during application startup with optional priority ordering.",
        exampleTitle: "Startup seed",
        exampleCode: [
          'import { ApplicationRunner } from "@xtaskjs/common";',
          'import { Service } from "@xtaskjs/core";',
          "",
          "@Service()",
          "export class SeedRunner {",
          "  @ApplicationRunner(100)",
          "  async seed() {",
          '    console.log("seeding application data");',
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-common-commandlinerunner",
        name: "CommandLineRunner",
        packageName: "@xtaskjs/common",
        packagePath: "packages/common/src/decorators/core/server/commandlinerunner.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Marks a method as a command-line lifecycle runner so it can execute in CLI-oriented flows.",
        exampleTitle: "CLI task",
        exampleCode: [
          'import { CommandLineRunner } from "@xtaskjs/common";',
          'import { Service } from "@xtaskjs/core";',
          "",
          "@Service()",
          "export class ReportsRunner {",
          "  @CommandLineRunner(0)",
          "  async generate() {",
          '    console.log("generating reports");',
          "  }",
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    id: "decorators-core",
    title: "Core DI And Components",
    description:
      "Dependency-injection and component decorators from @xtaskjs/core. These mark providers for container discovery and select named bindings for injection.",
    decorators: [
      {
        id: "decorator-core-component",
        name: "Component",
        packageName: "@xtaskjs/core",
        packagePath: "packages/core/src/di/component.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Low-level component decorator that stores DI metadata such as scope, condition, name, and primary selection.",
        exampleTitle: "Custom component metadata",
        exampleCode: [
          'import { Component } from "@xtaskjs/core";',
          "",
          '@Component({ scope: "singleton", name: "clock" })',
          "export class ClockService {}",
        ].join("\n"),
      },
      {
        id: "decorator-core-service",
        name: "Service",
        packageName: "@xtaskjs/core",
        packagePath: "packages/core/src/di/stereotypes.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Convenience stereotype for registering a class as a DI-managed service component.",
        exampleTitle: "Service stereotype",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          "",
          "@Service()",
          "export class BillingService {}",
        ].join("\n"),
      },
      {
        id: "decorator-core-controller",
        name: "Controller",
        packageName: "@xtaskjs/core",
        packagePath: "packages/core/src/di/stereotypes.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Registers a class as a controller component in the DI container. This is separate from the HTTP route decorator exported by @xtaskjs/common.",
        exampleTitle: "DI controller stereotype",
        exampleCode: [
          'import { Controller } from "@xtaskjs/core";',
          "",
          '@Controller({ name: "admin-controller" })',
          "export class AdminComponent {}",
        ].join("\n"),
      },
      {
        id: "decorator-core-repository",
        name: "Repository",
        packageName: "@xtaskjs/core",
        packagePath: "packages/core/src/di/stereotypes.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Convenience stereotype for repository-like providers managed by the DI container.",
        exampleTitle: "Repository stereotype",
        exampleCode: [
          'import { Repository } from "@xtaskjs/core";',
          "",
          "@Repository()",
          "export class UserLookupRepository {}",
        ].join("\n"),
      },
      {
        id: "decorator-core-autowired",
        name: "AutoWired / Autowired",
        packageName: "@xtaskjs/core",
        packagePath: "packages/core/src/di/autowired.ts",
        kind: "Property decorator",
        targets: "property",
        summary: "Injects a dependency into a property. The package also exports Autowired as an alias of AutoWired.",
        exampleTitle: "Property injection",
        exampleCode: [
          'import { AutoWired } from "@xtaskjs/core";',
          'import { UserService } from "./user.service";',
          "",
          "export class AccountController {",
          '  @AutoWired({ qualifier: UserService.name })',
          "  private readonly users!: UserService;",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-core-qualifier",
        name: "Qualifier",
        packageName: "@xtaskjs/core",
        packagePath: "packages/core/src/di/qualifier.ts",
        kind: "Parameter decorator",
        targets: "constructor parameter",
        summary: "Selects a named binding for constructor-parameter injection when multiple implementations share the same type.",
        exampleTitle: "Named constructor injection",
        exampleCode: [
          'import { Qualifier, Service } from "@xtaskjs/core";',
          "",
          "@Service()",
          "export class NotificationService {",
          '  constructor(@Qualifier("mailer:notifications") private readonly transport: any) {}',
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    id: "decorators-security",
    title: "Security And Authorization",
    description:
      "Authentication, authorization, strategy, and injector decorators exported by @xtaskjs/security. These layer on top of @xtaskjs/common route metadata.",
    decorators: [
      {
        id: "decorator-security-authenticated",
        name: "Authenticated",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/decorators.ts",
        kind: "Class and method decorator",
        targets: "class or method",
        summary: "Requires a successful authentication result before a controller or route executes. It can target a specific strategy or strategy list.",
        exampleTitle: "Protect a controller",
        exampleCode: [
          'import { Controller, Get } from "@xtaskjs/common";',
          'import { Authenticated } from "@xtaskjs/security";',
          "",
          '@Controller("/me")',
          "@Authenticated()",
          "export class ProfileController {",
          '  @Get("/")',
          "  profile(req: any) {",
          "    return req.user;",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-security-auth",
        name: "Auth",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/decorators.ts",
        kind: "Class and method decorator",
        targets: "class or method",
        summary: "Alias of Authenticated for projects that prefer a shorter decorator name.",
        exampleTitle: "Alias for Authenticated",
        exampleCode: [
          'import { Auth } from "@xtaskjs/security";',
          "",
          '@Auth(["default", "encrypted"])',
          "export class SecureAreaController {}",
        ].join("\n"),
      },
      {
        id: "decorator-security-roles",
        name: "Roles",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/decorators.ts",
        kind: "Class and method decorator",
        targets: "class or method",
        summary: "Applies role-based authorization requirements to an already authenticated route.",
        exampleTitle: "Role-gated endpoint",
        exampleCode: [
          'import { Controller, Get } from "@xtaskjs/common";',
          'import { Authenticated, Roles } from "@xtaskjs/security";',
          "",
          '@Controller("/admin")',
          "@Authenticated()",
          "export class AdminController {",
          '  @Get("/")',
          '  @Roles("admin")',
          "  dashboard() {",
          "    return { secure: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-security-allowanonymous",
        name: "AllowAnonymous",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/decorators.ts",
        kind: "Class and method decorator",
        targets: "class or method",
        summary: "Marks a route as publicly accessible even when the surrounding controller is authenticated by default.",
        exampleTitle: "Public health check",
        exampleCode: [
          'import { Controller, Get } from "@xtaskjs/common";',
          'import { AllowAnonymous, Authenticated } from "@xtaskjs/security";',
          "",
          '@Controller("/admin")',
          "@Authenticated()",
          "export class AdminController {",
          '  @Get("/health")',
          "  @AllowAnonymous()",
          "  health() {",
          "    return { ok: true };",
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-security-jwtstrategy",
        name: "JwtSecurityStrategy",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Decorator form of registerJwtStrategy() for registering a JWT strategy definition during module loading.",
        exampleTitle: "Decorator-based JWT strategy",
        exampleCode: [
          'import { JwtSecurityStrategy } from "@xtaskjs/security";',
          "",
          "@JwtSecurityStrategy({",
          '  name: "default",',
          "  default: true,",
          '  secretOrKey: process.env.JWT_SECRET,',
          "})",
          "export class DefaultJwtStrategy {}",
        ].join("\n"),
      },
      {
        id: "decorator-security-jwestrategy",
        name: "JweSecurityStrategy",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Decorator form of registerJweStrategy() for encrypted token flows.",
        exampleTitle: "Decorator-based JWE strategy",
        exampleCode: [
          'import { JweSecurityStrategy } from "@xtaskjs/security";',
          "",
          "@JweSecurityStrategy({",
          '  name: "encrypted",',
          '  decryptionKey: process.env.JWE_SECRET || "secret",',
          "})",
          "export class EncryptedStrategy {}",
        ].join("\n"),
      },
      {
        id: "decorator-security-injectauthservice",
        name: "InjectAuthenticationService",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/lifecycle.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects the SecurityAuthenticationService registered by the security lifecycle manager.",
        exampleTitle: "Inject auth service",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectAuthenticationService, SecurityAuthenticationService } from "@xtaskjs/security";',
          "",
          "@Service()",
          "export class SessionAuditService {",
          "  constructor(",
          "    @InjectAuthenticationService()",
          "    private readonly authentication: SecurityAuthenticationService",
          "  ) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-security-injectauthorizationservice",
        name: "InjectAuthorizationService",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/lifecycle.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects the SecurityAuthorizationService used for role and permission decisions.",
        exampleTitle: "Inject authorization service",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectAuthorizationService, SecurityAuthorizationService } from "@xtaskjs/security";',
          "",
          "@Service()",
          "export class PolicyService {",
          "  constructor(",
          "    @InjectAuthorizationService()",
          "    private readonly authorization: SecurityAuthorizationService",
          "  ) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-security-injectpassport",
        name: "InjectPassport",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/lifecycle.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects the configured Passport instance managed by xtaskjs security.",
        exampleTitle: "Inject Passport",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectPassport } from "@xtaskjs/security";',
          "",
          "@Service()",
          "export class PassportInspector {",
          "  constructor(@InjectPassport() private readonly passport: any) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-security-injectlifecycle",
        name: "InjectSecurityLifecycleManager",
        packageName: "@xtaskjs/security",
        packagePath: "packages/security/src/lifecycle.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects the SecurityLifecycleManager so advanced services can inspect strategies or authentication state wiring.",
        exampleTitle: "Inject lifecycle manager",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectSecurityLifecycleManager } from "@xtaskjs/security";',
          "",
          "@Service()",
          "export class SecurityDiagnosticsService {",
          "  constructor(@InjectSecurityLifecycleManager() private readonly lifecycle: any) {}",
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    id: "decorators-typeorm",
    title: "Persistence And Repositories",
    description:
      "TypeORM registration and injection decorators exported by @xtaskjs/typeorm. These bind datasources and repositories into the same DI container.",
    decorators: [
      {
        id: "decorator-typeorm-datasource",
        name: "TypeOrmDataSource",
        packageName: "@xtaskjs/typeorm",
        packagePath: "packages/typeorm/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Registers a TypeORM datasource definition for xtask startup and shutdown management.",
        exampleTitle: "Register a datasource",
        exampleCode: [
          'import { TypeOrmDataSource } from "@xtaskjs/typeorm";',
          'import { UserEntity } from "./user.entity";',
          "",
          "@TypeOrmDataSource({",
          '  name: "default",',
          '  type: "sqlite",',
          '  database: "app.sqlite",',
          "  entities: [UserEntity],",
          "  synchronize: true,",
          "})",
          "export class DatabaseConfig {}",
        ].join("\n"),
      },
      {
        id: "decorator-typeorm-injectdatasource",
        name: "InjectDataSource",
        packageName: "@xtaskjs/typeorm",
        packagePath: "packages/typeorm/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects a named datasource instance managed by xtaskjs TypeORM integration.",
        exampleTitle: "Inject the default datasource",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { DataSource, InjectDataSource } from "@xtaskjs/typeorm";',
          "",
          "@Service()",
          "export class HealthQueryService {",
          "  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-typeorm-injectrepository",
        name: "InjectRepository",
        packageName: "@xtaskjs/typeorm",
        packagePath: "packages/typeorm/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects a TypeORM repository for a given entity and datasource name.",
        exampleTitle: "Inject entity repository",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectRepository, Repository } from "@xtaskjs/typeorm";',
          'import { UserEntity } from "./user.entity";',
          "",
          "@Service()",
          "export class UsersService {",
          "  constructor(",
          "    @InjectRepository(UserEntity)",
          "    private readonly users: Repository<UserEntity>",
          "  ) {}",
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    id: "decorators-mailer",
    title: "Mailer Templates And Delivery",
    description:
      "Mailer decorators exported by @xtaskjs/mailer. These register transports and templates and inject delivery services into DI-managed classes.",
    decorators: [
      {
        id: "decorator-mailer-transport",
        name: "MailerTransport",
        packageName: "@xtaskjs/mailer",
        packagePath: "packages/mailer/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Decorator form of registerMailerTransport() for registering a named mail transport during module loading.",
        exampleTitle: "Register a transport with a decorator",
        exampleCode: [
          'import { MailerTransport, createMailtrapTransportOptions } from "@xtaskjs/mailer";',
          "",
          "@MailerTransport({",
          '  name: "default",',
          '  defaults: { from: "hello@xtaskjs.dev" },',
          "  transport: createMailtrapTransportOptions({",
          '    username: process.env.MAILTRAP_SMTP_USER || "user",',
          '    password: process.env.MAILTRAP_SMTP_PASS || "pass",',
          "  }),",
          "})",
          "export class DefaultTransportRegistration {}",
        ].join("\n"),
      },
      {
        id: "decorator-mailer-template",
        name: "MailerTemplate",
        packageName: "@xtaskjs/mailer",
        packagePath: "packages/mailer/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Decorator form of registerMailerTemplate() for reusable inline or file-rendered email templates.",
        exampleTitle: "Register a template",
        exampleCode: [
          'import { MailerTemplate } from "@xtaskjs/mailer";',
          "",
          "@MailerTemplate({",
          '  name: "welcome",',
          '  subject: "Welcome {{user.name}}",',
          '  text: "Hello {{user.name}}",',
          '  html: "<h1>Hello {{user.name}}</h1>",',
          "})",
          "export class WelcomeTemplateRegistration {}",
        ].join("\n"),
      },
      {
        id: "decorator-mailer-injectservice",
        name: "InjectMailerService",
        packageName: "@xtaskjs/mailer",
        packagePath: "packages/mailer/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects MailerService so a DI-managed service can render templates and send mail.",
        exampleTitle: "Inject mailer service",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectMailerService, MailerService } from "@xtaskjs/mailer";',
          "",
          "@Service()",
          "export class EmailService {",
          "  constructor(@InjectMailerService() private readonly mailer: MailerService) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-mailer-injecttransport",
        name: "InjectMailerTransport",
        packageName: "@xtaskjs/mailer",
        packagePath: "packages/mailer/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects a named transport so a service can send directly on a specific channel such as notifications.",
        exampleTitle: "Inject notifications transport",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectMailerTransport, MailerTransporter } from "@xtaskjs/mailer";',
          "",
          "@Service()",
          "export class AlertsService {",
          "  constructor(",
          '    @InjectMailerTransport("notifications")',
          "    private readonly notifications: MailerTransporter",
          "  ) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-mailer-injectlifecycle",
        name: "InjectMailerLifecycleManager",
        packageName: "@xtaskjs/mailer",
        packagePath: "packages/mailer/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects the MailerLifecycleManager for advanced inspection, verification, or transporter lookup.",
        exampleTitle: "Inject lifecycle manager",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectMailerLifecycleManager } from "@xtaskjs/mailer";',
          "",
          "@Service()",
          "export class MailDiagnosticsService {",
          "  constructor(@InjectMailerLifecycleManager() private readonly lifecycle: any) {}",
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    id: "decorators-internationalization",
    title: "Internationalization And Locale Resolution",
    description:
      "Configuration and injector decorators exported by @xtaskjs/internationalization. These register locale behavior and expose translation services inside DI-managed classes.",
    decorators: [
      {
        id: "decorator-internationalization-configuration",
        name: "Internationalization",
        packageName: "@xtaskjs/internationalization",
        packagePath: "packages/internationalization/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Decorator form of configureInternationalization() for registering default locale, fallback locale, currency, and timezone settings during module loading.",
        exampleTitle: "Register base internationalization settings",
        exampleCode: [
          'import { Internationalization } from "@xtaskjs/internationalization";',
          "",
          "@Internationalization({",
          '  defaultLocale: "en-US",',
          '  fallbackLocale: "en-US",',
          '  defaultCurrency: "USD",',
          '  defaultTimeZone: "UTC",',
          "})",
          "export class AppI18nConfiguration {}",
        ].join("\n"),
      },
      {
        id: "decorator-internationalization-locale",
        name: "InternationalizationLocale",
        packageName: "@xtaskjs/internationalization",
        packagePath: "packages/internationalization/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Registers a locale definition with translations, locale-specific currency and timezone values, and optional namespace dictionaries.",
        exampleTitle: "Register a locale catalog",
        exampleCode: [
          'import { InternationalizationLocale } from "@xtaskjs/internationalization";',
          "",
          "@InternationalizationLocale({",
          '  locale: "es-ES",',
          '  currency: "EUR",',
          '  timeZone: "Europe/Madrid",',
          '  translations: { home: { title: "Bienvenida" } },',
          "})",
          "export class SpanishLocaleRegistration {}",
        ].join("\n"),
      },
      {
        id: "decorator-internationalization-resolver",
        name: "InternationalizationResolver",
        packageName: "@xtaskjs/internationalization",
        packagePath: "packages/internationalization/src/configuration.ts",
        kind: "Class decorator",
        targets: "class",
        summary: "Registers a custom locale resolver that can derive locale context from the request, headers, container state, or tenant metadata.",
        exampleTitle: "Custom locale resolver",
        exampleCode: [
          'import { InternationalizationResolver } from "@xtaskjs/internationalization";',
          "",
          "@InternationalizationResolver(({ request }) => {",
          '  return request?.headers?.["x-locale"] || request?.query?.locale;',
          "})",
          "export class HeaderLocaleResolver {}",
        ].join("\n"),
      },
      {
        id: "decorator-internationalization-injectservice",
        name: "InjectInternationalizationService",
        packageName: "@xtaskjs/internationalization",
        packagePath: "packages/internationalization/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects InternationalizationService so controllers and services can translate keys, format values, inspect locales, and load namespaces on demand.",
        exampleTitle: "Inject translation service",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectInternationalizationService, InternationalizationService } from "@xtaskjs/internationalization";',
          "",
          "@Service()",
          "export class CheckoutPresenter {",
          "  constructor(",
          "    @InjectInternationalizationService()",
          "    private readonly intl: InternationalizationService",
          "  ) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-internationalization-injectlifecycle",
        name: "InjectInternationalizationLifecycleManager",
        packageName: "@xtaskjs/internationalization",
        packagePath: "packages/internationalization/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects the InternationalizationLifecycleManager for advanced inspection of loaded locales, namespaces, request context, or formatter registration.",
        exampleTitle: "Inject internationalization lifecycle",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectInternationalizationLifecycleManager } from "@xtaskjs/internationalization";',
          "",
          "@Service()",
          "export class LocaleDiagnosticsService {",
          "  constructor(",
          "    @InjectInternationalizationLifecycleManager()",
          "    private readonly lifecycle: any",
          "  ) {}",
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    id: "decorators-scheduler",
    title: "Scheduler Jobs And Lifecycle",
    description:
      "Scheduling decorators from @xtaskjs/scheduler used to declare cron, interval, and timeout jobs and to inject runtime scheduler services.",
    decorators: [
      {
        id: "decorator-scheduler-cron",
        name: "Cron",
        packageName: "@xtaskjs/scheduler",
        packagePath: "packages/scheduler/src/decorators.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a cron-based recurring job with optional groups, retries, timezone overrides, and boot execution behavior.",
        exampleTitle: "Cron job",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { Cron } from "@xtaskjs/scheduler";',
          "",
          "@Service()",
          "export class ReportsScheduler {",
          '  @Cron("0 */5 * * * *", { name: "reports.flush", group: ["reports", "nightly"] })',
          "  flushReports() {",
          '    console.log("flush pending reports");',
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-scheduler-every",
        name: "Every / Interval",
        packageName: "@xtaskjs/scheduler",
        packagePath: "packages/scheduler/src/decorators.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a fixed-interval recurring job. Interval is an alias of Every for projects that prefer the more explicit name.",
        exampleTitle: "Interval job",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { Every } from "@xtaskjs/scheduler";',
          "",
          "@Service()",
          "export class CacheScheduler {",
          '  @Every("10m", { name: "cache.compact", runOnInit: true })',
          "  compact() {",
          '    console.log("compact cache");',
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-scheduler-timeout",
        name: "Timeout",
        packageName: "@xtaskjs/scheduler",
        packagePath: "packages/scheduler/src/decorators.ts",
        kind: "Method decorator",
        targets: "method",
        summary: "Registers a one-shot delayed task that runs after startup instead of on a recurring cadence.",
        exampleTitle: "Delayed warmup job",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { Timeout } from "@xtaskjs/scheduler";',
          "",
          "@Service()",
          "export class WarmupScheduler {",
          '  @Timeout("30s", { name: "cache.warmup" })',
          "  warmup() {",
          '    console.log("warm cache once after startup");',
          "  }",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-scheduler-injectservice",
        name: "InjectSchedulerService",
        packageName: "@xtaskjs/scheduler",
        packagePath: "packages/scheduler/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects SchedulerService so services or controllers can inspect jobs and trigger groups or individual jobs manually.",
        exampleTitle: "Inject scheduler service",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectSchedulerService, SchedulerService } from "@xtaskjs/scheduler";',
          "",
          "@Service()",
          "export class SchedulerInspector {",
          "  constructor(",
          "    @InjectSchedulerService()",
          "    private readonly scheduler: SchedulerService",
          "  ) {}",
          "}",
        ].join("\n"),
      },
      {
        id: "decorator-scheduler-injectlifecycle",
        name: "InjectSchedulerLifecycleManager",
        packageName: "@xtaskjs/scheduler",
        packagePath: "packages/scheduler/src/decorators.ts",
        kind: "Parameter and property decorator",
        targets: "constructor parameter or property",
        summary: "Injects the SchedulerLifecycleManager for lower-level control over startup state, active handles, and discovered job metadata.",
        exampleTitle: "Inject scheduler lifecycle",
        exampleCode: [
          'import { Service } from "@xtaskjs/core";',
          'import { InjectSchedulerLifecycleManager } from "@xtaskjs/scheduler";',
          "",
          "@Service()",
          "export class SchedulerDiagnosticsService {",
          "  constructor(",
          "    @InjectSchedulerLifecycleManager()",
          "    private readonly lifecycle: any",
          "  ) {}",
          "}",
        ].join("\n"),
      },
    ],
  },
];

const decoratorCount = decoratorGroups.reduce((total, group) => total + group.decorators.length, 0);

const decoratorPackages = Array.from(
  new Set(decoratorGroups.flatMap((group) => group.decorators.map((decorator) => decorator.packageName)))
).sort((left, right) => left.localeCompare(right));

@Service()
export class DocumentationService {
  @InjectInternationalizationService()
  private readonly intl!: InternationalizationService;

  getHubViewModel(): DocumentationHubViewModel {
    const locale = this.intl.getCurrentLocale();
    const baseViewModel = this.getBaseViewModel("/documentation");

    return {
      ...baseViewModel,
      packageCount: packageDocs.length,
      sampleCount: sampleDocs.length,
      decoratorCount,
      highlights: localizeHighlights(locale, [
        {
          title: "Monorepo shape",
          text: "The upstream xtask repository groups runtime packages and sample applications in one workspace so APIs, adapters, decorators, and integrations evolve together.",
        },
        {
          title: "Decorator-first design",
          text: "Controllers, lifecycle hooks, guards, security rules, persistence bindings, and mail delivery are expressed through decorators and resolved at runtime through the kernel and container.",
        },
        {
          title: "Adapter and integration portability",
          text: "Business logic stays stable while node-http, Express, Fastify, TypeORM, security, and mailer integrations change how the app is delivered and extended.",
        },
      ]),
      featuredPages: baseViewModel.docsPages.filter(
        (page) => page.href !== "/documentation"
      ),
      quickStart: {
        install: "npm install @xtaskjs/core @xtaskjs/common reflect-metadata",
        bootstrap: [
          'import "reflect-metadata";',
          'import { CreateApplication } from "@xtaskjs/core";',
          "",
          "await CreateApplication({",
          '  adapter: "node-http",',
          "  autoListen: true,",
          '  server: { host: "127.0.0.1", port: 3000 },',
          "});",
        ].join("\n"),
      },
    };
  }

  getArchitectureViewModel(): DocumentationArchitectureViewModel {
    const locale = this.intl.getCurrentLocale();

    return {
      ...this.getBaseViewModel("/documentation/architecture"),
      quickStart: {
        install: "npm install @xtaskjs/core @xtaskjs/common reflect-metadata",
        bootstrap: [
          'import "reflect-metadata";',
          'import { CreateApplication } from "@xtaskjs/core";',
          "",
          "await CreateApplication({",
          '  adapter: "node-http",',
          "  autoListen: true,",
          '  server: { host: "127.0.0.1", port: 3000 },',
          "});",
        ].join("\n"),
      },
      bootstrapFlow: localizeFlowSteps(locale, [
        {
          title: "1. Define components",
          text: "Decorate services, controllers, runners, and listeners in src/ so the container can discover them.",
        },
        {
          title: "2. Call CreateApplication()",
          text: "Core allocates the application lifecycle, kernel, and selected HTTP adapter.",
        },
        {
          title: "3. Boot the kernel",
          text: "The container scans project directories, registers providers, and resolves component metadata.",
        },
        {
          title: "4. Attach integrations",
          text: "Optional packages such as typeorm and security register lifecycle bindings into the same container.",
        },
        {
          title: "5. Register routes and events",
          text: "Controllers and listeners are translated into lifecycle routes, handlers, and execution pipelines.",
        },
        {
          title: "6. Listen and serve",
          text: "The selected adapter starts accepting requests and dispatches them back through the lifecycle.",
        },
      ]),
      requestFlow: localizeFlowSteps(locale, [
        {
          title: "Adapter receives request",
          text: "Express, Fastify, or node-http normalizes the request and forwards method + path into the framework.",
        },
        {
          title: "Route lookup",
          text: "ApplicationLifeCycle resolves the controller route registered during startup.",
        },
        {
          title: "Guards and auth",
          text: "Guards can block or enrich the route context before the handler executes.",
        },
        {
          title: "Pipes and middlewares",
          text: "Arguments are transformed and cross-cutting logic runs in a consistent order.",
        },
        {
          title: "Controller handler",
          text: "The handler returns JSON, a primitive response, or a view(...) result.",
        },
        {
          title: "Adapter response",
          text: "The adapter serializes the payload, renders a view, or sends the appropriate status code.",
        },
      ]),
      securityFlow: localizeFlowSteps(locale, [
        {
          title: "Strategy registration",
          text: "JWT or JWE strategies are registered before startup, defining token extraction and validation callbacks.",
        },
        {
          title: "Security initialization",
          text: "CreateApplication() initializes the security lifecycle and publishes auth services into the container.",
        },
        {
          title: "Guard activation",
          text: "Authenticated, Auth, Roles, and AllowAnonymous decorate routes and drive guard decisions.",
        },
        {
          title: "Context enrichment",
          text: "Successful authentication populates req.user, req.auth, response locals, and route execution context.",
        },
      ]),
    };
  }

  getPackagesViewModel(): DocumentationPackagesViewModel {
    const locale = this.intl.getCurrentLocale();

    return {
      ...this.getBaseViewModel("/documentation/packages"),
      packageCount: packageDocs.length,
      packages: localizePackageDocs(locale, packageDocs),
    };
  }

  getPackageDetailViewModel(slug: string): DocumentationPackageDetailViewModel | undefined {
    const locale = this.intl.getCurrentLocale();
    const packages = localizePackageDocs(locale, packageDocs);
    const packageDoc = packages.find((entry) => entry.slug === slug);
    const packageDeepDive = packageDeepDiveDocs[slug];

    if (!packageDoc || !packageDeepDive) {
      return undefined;
    }

    const localizedDeepDive = localizePackageDeepDive(locale, packageDeepDive);

    return {
      ...this.getBaseViewModel(`/documentation/packages/${slug}`),
      packageDoc: {
        ...packageDoc,
        ...localizedDeepDive,
      },
      packageRepoUrl: `https://github.com/xtaskjs/xtask/tree/main/${packageDoc.path}`,
      sampleLinks: splitSampleCoverage(packageDoc.sample).map((sampleName) => ({
        name: sampleName,
        href: `/documentation/samples#sample-${sampleName}`,
      })),
      relatedPackages: packageDeepDive.related
        .map((relatedSlug) => packages.find((entry) => entry.slug === relatedSlug))
        .filter((entry): entry is PackageDoc => Boolean(entry))
        .map((entry) => ({
          name: entry.name,
          path: entry.path,
          tagline: entry.tagline,
          href: `/documentation/packages/${entry.slug}`,
        })),
      apiGroups: localizePackageApiGroups(locale, generatedPackageApiGroups[slug] || []),
    };
  }

  getSamplesViewModel(): DocumentationSamplesViewModel {
    const locale = this.intl.getCurrentLocale();

    return {
      ...this.getBaseViewModel("/documentation/samples"),
      sampleCount: sampleDocs.length,
      samples: localizeSampleDocs(locale, sampleDocs),
    };
  }

  getDecoratorsViewModel(): DocumentationDecoratorsViewModel {
    const locale = this.intl.getCurrentLocale();

    return {
      ...this.getBaseViewModel("/documentation/decorators"),
      decoratorCount,
      decoratorGroupCount: decoratorGroups.length,
      packageCoverage: decoratorPackages,
      decoratorGroups: localizeDecoratorGroups(locale, decoratorGroups),
    };
  }

  private getBaseViewModel(currentHref: string): DocumentationViewModel {
    return localizeDocumentationBase(this.intl.getCurrentLocale(), {
      title: "xTaskjs Documentation",
      repoUrl: "https://github.com/xtaskjs/xtask",
      docsPages: [
        {
          href: "/documentation",
          label: "Overview",
          description: "Hub with summary, quick start, and section entry points.",
          isCurrent: currentHref === "/documentation",
        },
        {
          href: "/documentation/architecture",
          label: "Architecture",
          description: "Boot lifecycle, request pipeline, and security flow diagrams.",
          isCurrent: currentHref === "/documentation/architecture",
        },
        {
          href: "/documentation/packages",
          label: "Packages",
          description: "Detailed reference for core, common, adapters, TypeORM, security, mailer, internationalization, and scheduler.",
          isCurrent:
            currentHref === "/documentation/packages" ||
            currentHref.startsWith("/documentation/packages/"),
        },
        {
          href: "/documentation/decorators",
          label: "Decorators",
          description: "Decorator catalog organized by type and package, with examples.",
          isCurrent: currentHref === "/documentation/decorators",
        },
        {
          href: "/documentation/samples",
          label: "Samples",
          description: "Official sample applications and how to use them.",
          isCurrent: currentHref === "/documentation/samples",
        },
      ],
    });
  }
}

const splitSampleCoverage = (value: string): readonly string[] =>
  Array.from(value.matchAll(/\b\d{2}-[a-z0-9_]+\b/gi), (match) => match[0]);