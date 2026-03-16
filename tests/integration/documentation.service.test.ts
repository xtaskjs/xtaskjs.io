import "reflect-metadata";
import test from "node:test";
import assert from "node:assert/strict";
import { DocumentationService } from "../../src/documentation/application/documentation.service";

function createService(locale: string): DocumentationService {
  const service = new DocumentationService() as DocumentationService & {
    intl: { getCurrentLocale(): string };
  };

  service.intl = {
    getCurrentLocale: () => locale,
  };

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