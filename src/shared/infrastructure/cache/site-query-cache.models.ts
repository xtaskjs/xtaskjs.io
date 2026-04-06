import { CacheModel } from "@xtaskjs/cache";
import { AppConfig } from "../config/app-config";

const deserializeDateField = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
};

const createCacheDeserializer = <T>(dateFieldNames: readonly string[]) => {
  const dateFields = new Set(dateFieldNames);

  return (value: string): T =>
    JSON.parse(value, (key: string, currentValue: unknown) =>
      dateFields.has(key) ? deserializeDateField(currentValue) : currentValue
    ) as T;
};

const serializeCacheValue = <T>(value: T): string => JSON.stringify(value);

const deserializeNewsCacheValue = createCacheDeserializer(["createdAt", "updatedAt"]);

const deserializeAdminUsersCacheValue = createCacheDeserializer([
  "createdAt",
  "updatedAt",
  "emailVerificationExpiresAt",
  "twoFactorExpiresAt",
  "passwordResetExpiresAt",
]);

@CacheModel({
  name: "news-queries",
  driver: "redis",
  ttl: AppConfig.cache.queryTtl,
  namespace: AppConfig.cache.namespace,
  prefix: "news-queries",
  serialize: serializeCacheValue,
  deserialize: deserializeNewsCacheValue,
})
export class NewsQueryCacheModel {}

@CacheModel({
  name: "admin-user-queries",
  driver: "redis",
  ttl: AppConfig.cache.queryTtl,
  namespace: AppConfig.cache.namespace,
  prefix: "admin-user-queries",
  serialize: serializeCacheValue,
  deserialize: deserializeAdminUsersCacheValue,
})
export class AdminUsersQueryCacheModel {}

export const QueryCacheSerialization = {
  serialize: serializeCacheValue,
  deserializeNews: deserializeNewsCacheValue,
  deserializeAdminUsers: deserializeAdminUsersCacheValue,
};