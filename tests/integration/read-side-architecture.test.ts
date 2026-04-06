import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";

test("News read service uses the CQRS read datasource and cache decorators", async () => {
  const filePath = path.join(process.cwd(), "src/news/application/news-read.service.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(source, /InjectReadDataSource\(\)/);
  assert.match(source, /@Cacheable\(/);
  assert.match(source, /NewsQueryCacheModel/);
});

test("Admin users read service uses the CQRS read datasource and cache decorators", async () => {
  const filePath = path.join(process.cwd(), "src/users/application/admin-users-read.service.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(source, /InjectReadDataSource\(\)/);
  assert.match(source, /@Cacheable\(/);
  assert.match(source, /AdminUsersQueryCacheModel/);
});

test("Query handlers delegate user and news reads to dedicated read-side services", async () => {
  const newsHandlersPath = path.join(process.cwd(), "src/news/application/cqrs/news.handlers.ts");
  const adminUsersHandlersPath = path.join(process.cwd(), "src/users/application/cqrs/admin-users.handlers.ts");
  const newsSource = await readFile(newsHandlersPath, "utf8");
  const adminUsersSource = await readFile(adminUsersHandlersPath, "utf8");

  assert.match(newsSource, /NewsReadService/);
  assert.match(newsSource, /GetLatestPublishedNewsHandler[\s\S]*newsReadService/);
  assert.match(newsSource, /GetAdminNewsPageHandler[\s\S]*newsReadService/);
  assert.match(adminUsersSource, /AdminUsersReadService/);
  assert.match(adminUsersSource, /GetAdminUserDetailHandler[\s\S]*adminUsersReadService/);
  assert.match(adminUsersSource, /ListAdminUsersHandler[\s\S]*adminUsersReadService/);
});