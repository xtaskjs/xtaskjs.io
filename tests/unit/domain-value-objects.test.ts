import test from "node:test";
import assert from "node:assert/strict";
import { NewsSlug } from "../../src/shared/domain/value-objects/news-slug";
import { PlainPassword } from "../../src/shared/domain/value-objects/plain-password";
import { QueryPageNumber, QueryPageSize } from "../../src/shared/domain/value-objects/query-pagination";
import { SecurityCode } from "../../src/shared/domain/value-objects/security-code";
import { Username } from "../../src/shared/domain/value-objects/username";

test("Username normalizes and validates usernames", () => {
  const username = Username.from("  Ada.Admin_01  ");

  assert.equal(username.value, "ada.admin_01");
  assert.throws(() => Username.from("no"), /between 3 and 30/);
  assert.throws(() => Username.from("bad user"), /may only contain/);
});

test("PlainPassword enforces the minimum password length", () => {
  const password = PlainPassword.from("Password123!");

  assert.equal(password.value, "Password123!");
  assert.throws(() => PlainPassword.from("short"), /at least 8 characters/);
});

test("SecurityCode accepts six-digit codes only", () => {
  const code = SecurityCode.from("123456");

  assert.equal(code.value, "123456");
  assert.throws(() => SecurityCode.from("12a456"), /exactly 6 digits/);
  assert.throws(() => SecurityCode.from("12345"), /exactly 6 digits/);
});

test("NewsSlug normalizes titles into slugs", () => {
  const slug = NewsSlug.fromTitle("  Hello, XTaskJS World!  ");

  assert.equal(slug.value, "hello-xtaskjs-world");
});

test("Query pagination value objects validate page boundaries", () => {
  assert.equal(QueryPageNumber.from(2).value, 2);
  assert.equal(QueryPageSize.from(20).value, 20);
  assert.throws(() => QueryPageNumber.from(0), /positive integer/);
  assert.throws(() => QueryPageSize.from(101), /between 1 and 100/);
});