import { Service } from "@xtaskjs/core";
import { DataSource } from "typeorm";
import type { News, CreateNewsInput, UpdateNewsInput } from "../../domain/news";
import type { NewsListOptions, NewsPage, NewsRepository } from "../../domain/news.repository";
import { NEWS_REPOSITORY } from "../../../shared/infrastructure/config/app-tokens";
import { getAppDataSource } from "../../../data-source";

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

@Service({ name: NEWS_REPOSITORY })
export class NewsTypeOrmRepository implements NewsRepository {
  private get dataSource(): DataSource {
    return getAppDataSource();
  }

  async findById(id: number): Promise<News | null> {
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

  async findBySlug(slug: string): Promise<News | null> {
    const rows = await this.dataSource.query(
      `
        SELECT id, title, slug, summary, content, image_url, is_published, created_at, updated_at
        FROM news
        WHERE slug = $1
        LIMIT 1
      `,
      [slug]
    );

    return rows[0] ? mapNewsRow(rows[0] as NewsRow) : null;
  }

  async findList(options: NewsListOptions): Promise<NewsPage> {
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

    const countRows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM news ${whereClause}`,
      params
    );

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

  async create(input: CreateNewsInput): Promise<News> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO news (title, slug, summary, content, image_url, is_published)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, title, slug, summary, content, image_url, is_published, created_at, updated_at
      `,
      [input.title, input.slug, input.summary, input.content, input.imageUrl, input.isPublished]
    );

    return mapNewsRow(rows[0] as NewsRow);
  }

  async update(id: number, input: UpdateNewsInput): Promise<News> {
    const assignments: string[] = [];
    const values: Array<string | number | boolean | null> = [];

    const pushAssignment = (column: string, value: string | number | boolean | null): void => {
      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    };

    if (input.title !== undefined) {
      pushAssignment("title", input.title);
    }
    if (input.slug !== undefined) {
      pushAssignment("slug", input.slug);
    }
    if (input.summary !== undefined) {
      pushAssignment("summary", input.summary);
    }
    if (input.content !== undefined) {
      pushAssignment("content", input.content);
    }
    if (input.imageUrl !== undefined) {
      pushAssignment("image_url", input.imageUrl);
    }
    if (input.isPublished !== undefined) {
      pushAssignment("is_published", input.isPublished);
    }

    assignments.push("updated_at = NOW()");
    values.push(id);

    const rows = await this.dataSource.query(
      `
        UPDATE news
        SET ${assignments.join(", ")}
        WHERE id = $${values.length}
        RETURNING id, title, slug, summary, content, image_url, is_published, created_at, updated_at
      `,
      values
    );

    if (!rows[0]) {
      throw new Error(`News item ${id} disappeared during update`);
    }

    return mapNewsRow(rows[0] as NewsRow);
  }

  async delete(id: number): Promise<void> {
    await this.dataSource.query(`DELETE FROM news WHERE id = $1`, [id]);
  }
}
