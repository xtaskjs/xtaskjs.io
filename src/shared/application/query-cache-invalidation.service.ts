import { CacheService, getCacheServiceToken } from "@xtaskjs/cache";
import { Service, getCurrentContainer } from "@xtaskjs/core";
import { AdminUsersQueryCacheModel, NewsQueryCacheModel } from "../infrastructure/cache/site-query-cache.models";

@Service()
export class QueryCacheInvalidationService {
  private resolveCache(): CacheService | null {
    const container = getCurrentContainer();

    if (!container) {
      return null;
    }

    try {
      return container.getByName<CacheService>(getCacheServiceToken());
    } catch {
      return null;
    }
  }

  async clearNewsQueries(): Promise<void> {
    const cache = this.resolveCache();
    if (!cache) {
      return;
    }

    await cache.clear(NewsQueryCacheModel);
  }

  async clearUserQueries(): Promise<void> {
    const cache = this.resolveCache();
    if (!cache) {
      return;
    }

    await cache.clear(AdminUsersQueryCacheModel);
  }
}