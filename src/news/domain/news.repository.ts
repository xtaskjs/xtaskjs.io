import type { News, CreateNewsInput, UpdateNewsInput } from "./news";

export type NewsListOptions = {
  readonly search?: string;
  readonly skip?: number;
  readonly take?: number;
  readonly publishedOnly?: boolean;
};

export type NewsPage = {
  readonly items: News[];
  readonly total: number;
};

export interface NewsRepository {
  findById(id: number): Promise<News | null>;
  findBySlug(slug: string): Promise<News | null>;
  findList(options: NewsListOptions): Promise<NewsPage>;
  create(input: CreateNewsInput): Promise<News>;
  update(id: number, input: UpdateNewsInput): Promise<News>;
  delete(id: number): Promise<void>;
}
