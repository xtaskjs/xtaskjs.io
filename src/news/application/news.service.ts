import { AutoWired, Service } from "@xtaskjs/core";
import type { News, CreateNewsInput, UpdateNewsInput } from "../domain/news";
import type { NewsPage, NewsRepository } from "../domain/news.repository";
import { QueryCacheInvalidationService } from "../../shared/application/query-cache-invalidation.service";
import { NewsSlug } from "../../shared/domain/value-objects/news-slug";
import { QueryPageNumber, QueryPageSize } from "../../shared/domain/value-objects/query-pagination";
import { NEWS_REPOSITORY } from "../../shared/infrastructure/config/app-tokens";

export type CreateNewsCommand = {
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly imageUrl: string | null;
  readonly isPublished: boolean;
};

export type UpdateNewsCommand = {
  readonly id: number;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly imageUrl?: string | null;
  readonly removeImage: boolean;
  readonly isPublished: boolean;
};

export type AdminListQuery = {
  readonly search: string;
  readonly page: number;
  readonly pageSize: number;
};

@Service()
export class NewsService {
  @AutoWired({ qualifier: NEWS_REPOSITORY })
  private readonly repository!: NewsRepository;

  @AutoWired({ qualifier: QueryCacheInvalidationService.name })
  private readonly queryCacheInvalidation!: QueryCacheInvalidationService;

  async getLatestPublished(limit: number): Promise<News[]> {
    const { items } = await this.repository.findList({
      publishedOnly: true,
      take: QueryPageSize.from(limit).value,
    });
    return items;
  }

  async getAllPublished(): Promise<News[]> {
    const { items } = await this.repository.findList({ publishedOnly: true });
    return items;
  }

  async getAdminPage(query: AdminListQuery): Promise<NewsPage & { totalPages: number }> {
    const currentPage = QueryPageNumber.from(query.page);
    const currentPageSize = QueryPageSize.from(query.pageSize);
    const skip = (currentPage.value - 1) * currentPageSize.value;
    const result = await this.repository.findList({
      search: query.search || undefined,
      skip,
      take: currentPageSize.value,
    });
    const totalPages = Math.ceil(result.total / currentPageSize.value);
    return { ...result, totalPages };
  }

  async getById(id: number): Promise<News | null> {
    return this.repository.findById(id);
  }

  async create(command: CreateNewsCommand): Promise<News> {
    const baseSlug = NewsSlug.fromTitle(command.title).value || `news-${Date.now()}`;
    const uniqueSlug = await this.resolveUniqueSlug(baseSlug);
    const input: CreateNewsInput = { ...command, slug: uniqueSlug };
    const created = await this.repository.create(input);
    await this.queryCacheInvalidation.clearNewsQueries();
    return created;
  }

  async update(command: UpdateNewsCommand): Promise<News> {
    const existing = await this.repository.findById(command.id);
    if (!existing) {
      throw new Error(`News item ${command.id} not found`);
    }

    const baseSlug = NewsSlug.fromTitle(command.title).value || `news-${Date.now()}`;
    const uniqueSlug = await this.resolveUniqueSlug(baseSlug, command.id);

    const resolvedImageUrl = command.removeImage
      ? null
      : command.imageUrl !== undefined
        ? command.imageUrl
        : existing.imageUrl;

    const input: UpdateNewsInput = {
      title: command.title,
      slug: uniqueSlug,
      summary: command.summary,
      content: command.content,
      imageUrl: resolvedImageUrl,
      isPublished: command.isPublished,
    };

    const updated = await this.repository.update(command.id, input);
    await this.queryCacheInvalidation.clearNewsQueries();
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
    await this.queryCacheInvalidation.clearNewsQueries();
  }

  private async resolveUniqueSlug(base: string, currentId?: number): Promise<string> {
    let candidate = base;
    let suffix = 1;

    while (true) {
      const existing = await this.repository.findBySlug(candidate);
      if (!existing || existing.id === currentId) {
        return candidate;
      }
      suffix += 1;
      candidate = NewsSlug.fromTitle(`${base}-${suffix}`).value;
    }
  }
}
