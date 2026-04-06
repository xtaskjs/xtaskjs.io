import test from "node:test";
import assert from "node:assert/strict";
import { UserAccountAggregate } from "../../src/users/domain/user-account.aggregate";

test("UserAccountAggregate records registration, verification, reset, and login activity", () => {
  const aggregate = new UserAccountAggregate();
  const expiresAt = new Date("2026-04-02T12:00:00.000Z");

  aggregate.register(42, "ada", "ada@example.com");
  aggregate.issueEmailVerificationCode(42, expiresAt);
  aggregate.markEmailVerified(42);
  aggregate.requestPasswordReset(42, expiresAt);
  aggregate.completePasswordReset(42);
  aggregate.recordLogin(42, "127.0.0.1", "Madrid, ES", "test-agent");

  const snapshot = aggregate.snapshot();

  assert.equal(snapshot.registered, true);
  assert.equal(snapshot.userId, 42);
  assert.equal(snapshot.username, "ada");
  assert.equal(snapshot.email, "ada@example.com");
  assert.equal(snapshot.emailVerified, true);
  assert.equal(snapshot.loginCount, 1);
  assert.ok(snapshot.passwordResetRequestedAt);
  assert.ok(snapshot.passwordResetCompletedAt);
  assert.ok(snapshot.lastLoginAt);
  assert.equal(aggregate.getUncommittedEvents().length, 6);
});