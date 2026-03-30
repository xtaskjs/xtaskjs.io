import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";

test("AccountController routes registration through the command bus", async () => {
  const filePath = path.join(process.cwd(), "src/users/infrastructure/http/account.controller.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(source, /InjectCommandBus\(\)/);
  assert.match(source, /new RegisterAccountCommand\(/);
});

test("News controllers route reads and writes through CQRS buses", async () => {
  const adminControllerPath = path.join(process.cwd(), "src/news/infrastructure/http/admin-news.controller.ts");
  const publicControllerPath = path.join(process.cwd(), "src/news/infrastructure/http/public-site.controller.ts");
  const adminSource = await readFile(adminControllerPath, "utf8");
  const publicSource = await readFile(publicControllerPath, "utf8");

  assert.match(adminSource, /InjectQueryBus\(\)/);
  assert.match(adminSource, /InjectCommandBus\(\)/);
  assert.match(adminSource, /new GetAdminNewsPageQuery\(/);
  assert.match(adminSource, /new GetNewsByIdQuery\(/);
  assert.match(adminSource, /new CreateNewsItemCommand\(/);
  assert.match(adminSource, /new UpdateNewsItemCommand\(/);
  assert.match(adminSource, /new DeleteNewsItemCommand\(/);
  assert.match(publicSource, /InjectQueryBus\(\)/);
  assert.match(publicSource, /new GetLatestPublishedNewsQuery\(/);
  assert.match(publicSource, /new GetAllPublishedNewsQuery\(/);
});

test("Registration and news handlers use xtask CQRS decorators", async () => {
  const accountHandlersPath = path.join(process.cwd(), "src/auth/application/cqrs/account-registration.handlers.ts");
  const newsHandlersPath = path.join(process.cwd(), "src/news/application/cqrs/news.handlers.ts");
  const accountSource = await readFile(accountHandlersPath, "utf8");
  const newsSource = await readFile(newsHandlersPath, "utf8");

  assert.match(accountSource, /@CommandHandler\(RegisterAccountCommand\)/);
  assert.match(accountSource, /implements ICommandHandler<RegisterAccountCommand, RegisterAccountResult>/);
  assert.match(accountSource, /getCurrentContainer\(\)/);
  assert.doesNotMatch(accountSource, /AutoWired\(\{ qualifier: AccountAccessService.name \}\)/);
  assert.match(newsSource, /@QueryHandler\(GetLatestPublishedNewsQuery\)/);
  assert.match(newsSource, /@QueryHandler\(GetAllPublishedNewsQuery\)/);
  assert.match(newsSource, /@QueryHandler\(GetAdminNewsPageQuery\)/);
  assert.match(newsSource, /@QueryHandler\(GetNewsByIdQuery\)/);
  assert.match(newsSource, /@CommandHandler\(CreateNewsItemCommand\)/);
  assert.match(newsSource, /@CommandHandler\(UpdateNewsItemCommand\)/);
  assert.match(newsSource, /@CommandHandler\(DeleteNewsItemCommand\)/);
});