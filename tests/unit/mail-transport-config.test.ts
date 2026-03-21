import test from "node:test";
import assert from "node:assert/strict";
import {
  createMailTransport,
  inferMailTransportProvider,
  resolveMailTransportProvider,
  type MailTransportAccounts,
} from "../../src/shared/infrastructure/config/mail-transport-config";

const createAccounts = (overrides?: Partial<MailTransportAccounts>): MailTransportAccounts => ({
  mailtrap: {
    username: undefined,
    password: undefined,
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    ...overrides?.mailtrap,
  },
  smtp: {
    username: undefined,
    password: undefined,
    host: "smtp.example.com",
    port: 587,
    secure: false,
    ...overrides?.smtp,
  },
});

test("inferMailTransportProvider preserves legacy Mailtrap-first behavior", () => {
  const provider = inferMailTransportProvider(
    createAccounts({
      mailtrap: { username: "mailtrap-user", password: "mailtrap-pass", secure: false },
      smtp: { username: "smtp-user", password: "smtp-pass", secure: false },
    }),
  );

  assert.equal(provider, "mailtrap");
});

test("resolveMailTransportProvider accepts explicit smtp when configured", () => {
  const provider = resolveMailTransportProvider(
    "smtp",
    createAccounts({
      smtp: { username: "smtp-user", password: "smtp-pass", secure: false },
    }),
  );

  assert.equal(provider, "smtp");
});

test("resolveMailTransportProvider falls back to json for incomplete explicit providers", () => {
  const provider = resolveMailTransportProvider(
    "smtp",
    createAccounts({
      smtp: { username: "smtp-user", secure: false },
    }),
  );

  assert.equal(provider, "json");
});

test("createMailTransport returns smtp transport options", () => {
  const transport = createMailTransport({
    provider: "smtp",
    ...createAccounts({
      smtp: {
        username: "smtp-user",
        password: "smtp-pass",
        host: "smtp.ionos.es",
        port: 465,
        secure: true,
      },
    }),
  });

  assert.deepEqual(transport, {
    host: "smtp.ionos.es",
    port: 465,
    secure: true,
    auth: {
      user: "smtp-user",
      pass: "smtp-pass",
    },
  });
});

test("createMailTransport returns mailtrap helper options", () => {
  const transport = createMailTransport({
    provider: "mailtrap",
    ...createAccounts({
      mailtrap: {
        username: "mailtrap-user",
        password: "mailtrap-pass",
        secure: false,
      },
    }),
  });

  assert.deepEqual(transport, {
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
      user: "mailtrap-user",
      pass: "mailtrap-pass",
    },
  });
});