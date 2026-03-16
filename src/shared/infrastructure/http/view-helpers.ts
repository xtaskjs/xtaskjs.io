import type { News } from "../../../news/domain/news";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export type NewsViewModel = News & {
  readonly createdAtLabel: string;
  readonly updatedAtLabel: string;
};

export const toNewsViewModel = (
  news: News,
  formatDateTime: (value: Date) => string = (value) => dateFormatter.format(value)
): NewsViewModel => ({
  ...news,
  imageUrl: news.imageUrl ?? null,
  createdAtLabel: formatDateTime(news.createdAt),
  updatedAtLabel: formatDateTime(news.updatedAt),
});

export const normalizeText = (value: unknown): string =>
  String(value ?? "").trim();
