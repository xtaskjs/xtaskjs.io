import "reflect-metadata";
import test from "node:test";
import assert from "node:assert/strict";
import { DocumentationService } from "../../src/documentation/application/documentation.service";

function createService(locale: string): DocumentationService {
  const service = new DocumentationService();

  Object.defineProperty(service, "intl", {
    value: {
      getCurrentLocale: () => locale,
    },
    configurable: true,
  });

  return service;
}

test("DocumentationService returns package detail API groups and sample links", () => {
  const service = createService("en-US");
  const detail = service.getPackageDetailViewModel("core");

  assert.ok(detail);
  assert.equal(detail?.apiGroups.length, 3);
  assert.deepEqual(detail?.sampleLinks.slice(0, 3).map((entry) => entry.name), [
    "01-new_app",
    "02-express_app",
    "03-fastify_app",
  ]);
});

test("DocumentationService ignores prose-only sample descriptions", () => {
  const service = createService("en-US");
  const detail = service.getPackageDetailViewModel("common");

  assert.ok(detail);
  assert.equal(detail?.sampleLinks.length, 0);
});

test("DocumentationService localizes API group titles", () => {
  const service = createService("es-ES");
  const detail = service.getPackageDetailViewModel("core");

  assert.ok(detail);
  assert.equal(detail?.apiGroups[0]?.title, "Arranque y aplicación");
});

test("DocumentationService returns cache package detail with cache-specific API groups and sample links", () => {
  const service = createService("en-US");
  const detail = service.getPackageDetailViewModel("cache");

  assert.ok(detail);
  assert.equal(detail?.apiGroups.length, 4);
  assert.deepEqual(detail?.apiGroups.map((group) => group.title), [
    "Configuration and models",
    "Repository and services",
    "HTTP caching and management",
    "Lifecycle surface",
  ]);
  assert.deepEqual(detail?.sampleLinks.map((entry) => entry.name), [
    "12-cache_app",
    "13-cache_redis_app",
    "14-http_cache_web_app",
    "15-fastify_http_cache_web_app",
  ]);
});

test("DocumentationService returns queues package detail with queue-specific API groups and sample links", () => {
  const service = createService("en-US");
  const detail = service.getPackageDetailViewModel("queues");

  assert.ok(detail);
  assert.equal(detail?.apiGroups.length, 3);
  assert.deepEqual(detail?.apiGroups.map((group) => group.title), [
    "Configuration and transports",
    "Decorators and injectors",
    "Runtime service and lifecycle",
  ]);
  assert.deepEqual(detail?.sampleLinks.map((entry) => entry.name), [
    "16-queues_memory_app",
    "17-queues_rabbitmq_app",
  ]);
});

test("DocumentationService returns value-objects package detail with package-specific API groups and no sample links", () => {
  const service = createService("en-US");
  const detail = service.getPackageDetailViewModel("value-objects");

  assert.ok(detail);
  assert.equal(detail?.apiGroups.length, 5);
  assert.deepEqual(detail?.apiGroups.map((group) => group.title), [
    "Types and contracts",
    "Conversion helpers",
    "Base value objects",
    "Factory helpers",
    "DTO decorators",
  ]);
  assert.deepEqual(detail?.sampleLinks, []);
});

test("DocumentationService returns CLI docs with command and option groups", () => {
  const service = createService("en-US");
  const cli = service.getCliViewModel();

  assert.equal(cli.packageName, "@xtaskjs/cli");
  assert.equal(cli.commandCount, 2);
  assert.match(cli.installDocs[0]?.command || "", /npm install -g @xtaskjs\/cli/);
  assert.equal(cli.optionGroups[2]?.options.some((option) => option.flag === "--crud"), true);
  assert.equal(cli.highlights.some((highlight) => highlight.title === "Cache workflow"), true);
  assert.equal(
    cli.commands[1]?.examples.some((example) => example.command === "xtask generate resource cache-entries --path src/modules --crud --with-dto"),
    true,
  );
  assert.equal(
    cli.notes.some((note) => note.includes("does not ship a dedicated cache generator")),
    true,
  );
});

test("DocumentationService localizes CLI option group titles", () => {
  const service = createService("es-ES");
  const cli = service.getCliViewModel();

  assert.equal(cli.optionGroups[1]?.title, "Opciones de creación de proyectos");
  assert.equal(cli.troubleshooting[0]?.title, "1. Comprueba el entorno Node activo");
});

test("DocumentationService exposes cache decorators in the catalog", () => {
  const service = createService("en-US");
  const decorators = service.getDecoratorsViewModel();

  assert.equal(decorators.packageCoverage.includes("@xtaskjs/cache"), true);
  assert.equal(
    decorators.decoratorGroups.some((group) => group.id === "decorators-cache-runtime"),
    true
  );
  assert.equal(
    decorators.decoratorGroups.some((group) => group.id === "decorators-cache-http"),
    true
  );
});

test("DocumentationService exposes value-object decorators in the catalog", () => {
  const service = createService("en-US");
  const decorators = service.getDecoratorsViewModel();
  const valueObjectGroup = decorators.decoratorGroups.find(
    (group) => group.id === "decorators-value-objects"
  );

  assert.equal(decorators.packageCoverage.includes("@xtaskjs/value-objects"), true);
  assert.ok(valueObjectGroup);
  assert.equal(valueObjectGroup?.decorators[0]?.name, "TransformValueObject");
  assert.match(valueObjectGroup?.decorators[0]?.exampleCode || "", /@TransformValueObject\(EmailAddress\)/);
});

test("DocumentationService exposes queue samples and decorators in the catalog", () => {
  const service = createService("en-US");
  const samples = service.getSamplesViewModel();
  const decorators = service.getDecoratorsViewModel();

  assert.equal(
    samples.samples.some((sample) => sample.name === "16-queues_memory_app"),
    true
  );
  assert.equal(
    samples.samples.some((sample) => sample.name === "17-queues_rabbitmq_app"),
    true
  );
  assert.equal(decorators.packageCoverage.includes("@xtaskjs/queues"), true);
  assert.equal(
    decorators.decoratorGroups.some((group) => group.id === "decorators-queues"),
    true
  );
});