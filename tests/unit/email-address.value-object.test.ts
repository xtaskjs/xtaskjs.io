import test from "node:test";
import assert from "node:assert/strict";
import { Container, getComponentMetadata } from "@xtaskjs/core";
import { EmailAddress, EmailAddressFactory } from "../../src/shared/domain/value-objects/email-address";

test("EmailAddress normalizes valid email values", () => {
  const email = EmailAddress.from(" USER@Example.com ");

  assert.equal(email.value, "user@example.com");
  assert.equal(email.toString(), "user@example.com");
});

test("EmailAddress rejects invalid values", () => {
  assert.throws(() => EmailAddress.from("not-an-email"), /Invalid email address/);
});

test("EmailAddressFactory can be resolved through the xtaskjs container", () => {
  const container = new Container();
  const componentMetadata = getComponentMetadata(EmailAddressFactory) || {
    scope: "singleton" as const,
  };

  container.registerWithName(
    EmailAddressFactory,
    componentMetadata,
    componentMetadata.name || EmailAddressFactory.name
  );

  const factory = container.get(EmailAddressFactory);
  const email = factory.fromString("ADMIN@Example.com");

  assert.ok(factory instanceof EmailAddressFactory);
  assert.equal(email.value, "admin@example.com");
});