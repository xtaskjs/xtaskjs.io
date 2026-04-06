import test from "node:test";
import assert from "node:assert/strict";
import { QueryCacheSerialization } from "../../src/shared/infrastructure/cache/site-query-cache.models";

test("news query cache revives date fields after deserialization", () => {
  const createdAt = new Date("2026-04-02T10:15:00.000Z");
  const updatedAt = new Date("2026-04-02T11:45:00.000Z");
  const serialized = QueryCacheSerialization.serialize({
    items: [
      {
        id: 1,
        title: "Release",
        slug: "release",
        summary: "Summary",
        content: "Content",
        imageUrl: null,
        isPublished: true,
        createdAt,
        updatedAt,
      },
    ],
    total: 1,
    totalPages: 1,
  });

  const restored = QueryCacheSerialization.deserializeNews(serialized) as {
    items: Array<{ createdAt: Date; updatedAt: Date }>;
  };

  assert.ok(restored.items[0].createdAt instanceof Date);
  assert.ok(restored.items[0].updatedAt instanceof Date);
  assert.equal(restored.items[0].createdAt.toISOString(), createdAt.toISOString());
  assert.equal(restored.items[0].updatedAt.toISOString(), updatedAt.toISOString());
});

test("admin user query cache revives nested date fields after deserialization", () => {
  const createdAt = new Date("2026-04-02T12:00:00.000Z");
  const updatedAt = new Date("2026-04-02T12:30:00.000Z");
  const loginAt = new Date("2026-04-02T13:00:00.000Z");
  const verificationExpiresAt = new Date("2026-04-02T14:00:00.000Z");
  const serialized = QueryCacheSerialization.serialize({
    items: [
      {
        id: 7,
        fullName: "Admin User",
        username: "admin",
        email: "admin@example.com",
        receiveNewsUpdates: true,
        newsletterSubscribed: true,
        passwordHash: "hash",
        role: "admin",
        isActive: true,
        emailVerified: true,
        emailVerificationCodeHash: null,
        emailVerificationExpiresAt: verificationExpiresAt,
        twoFactorCodeHash: null,
        twoFactorExpiresAt: null,
        passwordResetCodeHash: null,
        passwordResetExpiresAt: null,
        registrationIpAddress: null,
        registrationCountryCode: null,
        registrationCountryName: null,
        createdAt,
        updatedAt,
      },
    ],
    total: 1,
    totalPages: 1,
    recentLoginEvents: {
      7: [
        {
          id: 3,
          userId: 7,
          ipAddress: null,
          countryCode: null,
          countryName: null,
          region: null,
          city: null,
          locationLabel: null,
          userAgent: null,
          createdAt: loginAt,
        },
      ],
    },
  });

  const restored = QueryCacheSerialization.deserializeAdminUsers(serialized) as {
    items: Array<{
      createdAt: Date;
      updatedAt: Date;
      emailVerificationExpiresAt: Date | null;
    }>;
    recentLoginEvents: Record<number, Array<{ createdAt: Date }>>;
  };

  assert.ok(restored.items[0].createdAt instanceof Date);
  assert.ok(restored.items[0].updatedAt instanceof Date);
  assert.ok(restored.items[0].emailVerificationExpiresAt instanceof Date);
  assert.ok(restored.recentLoginEvents[7][0].createdAt instanceof Date);
  assert.equal(restored.items[0].createdAt.toISOString(), createdAt.toISOString());
  assert.equal(restored.items[0].updatedAt.toISOString(), updatedAt.toISOString());
  assert.equal(restored.items[0].emailVerificationExpiresAt?.toISOString(), verificationExpiresAt.toISOString());
  assert.equal(restored.recentLoginEvents[7][0].createdAt.toISOString(), loginAt.toISOString());
});