import { Cacheable } from "@xtaskjs/cache";
import { InjectReadDataSource } from "@xtaskjs/cqrs";
import { Service } from "@xtaskjs/core";
import { DataSource } from "typeorm";
import type { News } from "../domain/news";
import type { NewsPage } from "../domain/news.repository";
import { QueryPageNumber, QueryPageSize } from "../../shared/domain/value-objects/query-pagination";
import { NewsQueryCacheModel } from "../../shared/infrastructure/cache/site-query-cache.models";

type NewsRow = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string | null;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
};

const mapNewsRow = (row: NewsRow): News => ({
  id: Number(row.id),
  title: row.title,
  slug: row.slug,
  summary: row.summary,
  content: row.content,
  imageUrl: row.image_url,
  isPublished: Boolean(row.is_published),
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

@Service()
export class NewsReadService {
  @InjectReadDataSource()
  private readonly dataSource!: DataSource;

  @Cacheable({ model: NewsQueryCacheModel, key: (limit: number) => `latest:${QueryPageSize.from(limit).value}` })
  async getLatestPublished(limit: number): Promise<News[]> {
    const { items } = await this.findList({
      publishedOnly: true,
      take: QueryPageSize.from(limit).value,
    });

    return items;
  }

  @Cacheable({ model: NewsQueryCacheModel, key: () => "published:all" })
  async getAllPublished(): Promise<News[]> {
    const { items } = await this.findList({ publishedOnly: true });
    return items;
  }

  @Cacheable({
    model: NewsQueryCacheModel,
    key: (query: { search: string; page: number; pageSize: number }) =>
      `admin:${query.search || "all"}:${QueryPageNumber.from(query.page).value}:${QueryPageSize.from(query.pageSize).value}`,
  })
  async getAdminPage(query: { search: string; page: number; pageSize: number }): Promise<NewsPage & { totalPages: number }> {
    const currentPage = QueryPageNumber.from(query.page);
    const currentPageSize = QueryPageSize.from(query.pageSize);
    const skip = (currentPage.value - 1) * currentPageSize.value;
    const result = await this.findList({
      search: query.search || undefined,
      skip,
      take: currentPageSize.value,
    });

    return {
      ...result,
      totalPages: Math.ceil(result.total / currentPageSize.value),
    };
  }

  @Cacheable({ model: NewsQueryCacheModel, key: (id: number) => `by-id:${id}` })
  async getById(id: number): Promise<News | null> {
    const rows = await this.dataSource.query(
      `
        SELECT id, title, slug, summary, content, image_url, is_published, created_at, updated_at
        FROM news
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    return rows[0] ? mapNewsRow(rows[0] as NewsRow) : null;
  }

  private async findList(options: {
    search?: string;
    skip?: number;
    take?: number;
    publishedOnly?: boolean;
  }): Promise<NewsPage> {
    const { search, skip, take, publishedOnly } = options;
    const conditions: string[] = [];
    const params: Array<string | number | boolean> = [];

    if (publishedOnly) {
      params.push(true);
      conditions.push(`is_published = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const index = params.length;
      conditions.push(`(title ILIKE $${index} OR summary ILIKE $${index})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countRows = await this.dataSource.query(`SELECT COUNT(*)::int AS total FROM news ${whereClause}`, params);

    const listParams = [...params];
    let paginationClause = "";
    if (take !== undefined) {
      listParams.push(take);
      paginationClause += ` LIMIT $${listParams.length}`;
    }
    if (skip !== undefined) {
      listParams.push(skip);
      paginationClause += ` OFFSET $${listParams.length}`;
    }

    const itemRows = await this.dataSource.query(
      `
        SELECT id, title, slug, summary, content, image_url, is_published, created_at, updated_at
        FROM news
        ${whereClause}
        ORDER BY created_at DESC
        ${paginationClause}
      `,
      listParams
    );

    return {
      items: itemRows.map((row: NewsRow) => mapNewsRow(row)),
      total: Number(countRows[0]?.total || 0),
    };
  }
}