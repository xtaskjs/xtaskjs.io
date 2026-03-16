import { AutoWired, Service } from "@xtaskjs/core";
import type { News, CreateNewsInput, UpdateNewsInput } from "../domain/news";
import type { NewsPage, NewsRepository } from "../domain/news.repository";
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

const slugify = (text: string): string =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

@Service()
export class NewsService {
  @AutoWired({ qualifier: NEWS_REPOSITORY })
  private readonly repository!: NewsRepository;

  async getLatestPublished(limit: number): Promise<News[]> {
    const { items } = await this.repository.findList({
      publishedOnly: true,
      take: limit,
    });
    return items;
  }

  async getAllPublished(): Promise<News[]> {
    const { items } = await this.repository.findList({ publishedOnly: true });
    return items;
  }

  async getAdminPage(query: AdminListQuery): Promise<NewsPage & { totalPages: number }> {
    const skip = (query.page - 1) * query.pageSize;
    const page = await this.repository.findList({
      search: query.search || undefined,
      skip,
      take: query.pageSize,
    });
    const totalPages = Math.ceil(page.total / query.pageSize);
    return { ...page, totalPages };
  }

  async getById(id: number): Promise<News | null> {
    return this.repository.findById(id);
  }

  async create(command: CreateNewsCommand): Promise<News> {
    const baseSlug = slugify(command.title) || `news-${Date.now()}`;
    const uniqueSlug = await this.resolveUniqueSlug(baseSlug);
    const input: CreateNewsInput = { ...command, slug: uniqueSlug };
    return this.repository.create(input);
  }

  async update(command: UpdateNewsCommand): Promise<News> {
    const existing = await this.repository.findById(command.id);
    if (!existing) {
      throw new Error(`News item ${command.id} not found`);
    }

    const baseSlug = slugify(command.title) || `news-${Date.now()}`;
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

    return this.repository.update(command.id, input);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
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
      candidate = `${base}-${suffix}`;
    }
  }
}
