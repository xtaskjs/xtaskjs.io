import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";

test("AdminUsersController routes detail, list, and write updates through CQRS buses", async () => {
  const filePath = path.join(process.cwd(), "src/users/infrastructure/http/admin-users.controller.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(source, /InjectQueryBus\(\)/);
  assert.match(source, /InjectCommandBus\(\)/);
  assert.match(source, /new GetAdminUserDetailQuery\(/);
  assert.match(source, /new ListAdminUsersQuery\(/);
  assert.match(source, /new UpdateUserRoleCommand\(/);
  assert.match(source, /new UpdateUserStatusCommand\(/);
  assert.doesNotMatch(source, /private readonly userService!/);
});

test("Admin users CQRS handlers use xtask decorators", async () => {
  const filePath = path.join(process.cwd(), "src/users/application/cqrs/admin-users.handlers.ts");
  const source = await readFile(filePath, "utf8");

  assert.match(source, /@QueryHandler\(GetAdminUserDetailQuery\)/);
  assert.match(source, /@QueryHandler\(ListAdminUsersQuery\)/);
  assert.match(source, /@CommandHandler\(UpdateUserRoleCommand\)/);
  assert.match(source, /@CommandHandler\(UpdateUserStatusCommand\)/);
  assert.match(source, /implements IQueryHandler<GetAdminUserDetailQuery, AdminUserDetailResult>/);
  assert.match(source, /implements IQueryHandler<ListAdminUsersQuery, ListAdminUsersResult>/);
  assert.match(source, /implements ICommandHandler<UpdateUserRoleCommand, void>/);
  assert.match(source, /implements ICommandHandler<UpdateUserStatusCommand, void>/);
});