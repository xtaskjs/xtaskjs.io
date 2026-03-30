import type { News } from "../../domain/news";
import type { NewsPage } from "../../domain/news.repository";

export class GetLatestPublishedNewsQuery {
  constructor(public readonly limit: number) {}
}

export class GetAllPublishedNewsQuery {}

export class GetAdminNewsPageQuery {
  constructor(
    public readonly search: string,
    public readonly page: number,
    public readonly pageSize: number
  ) {}
}

export type GetNewsPageResult = NewsPage & {
  readonly totalPages: number;
};

export class GetNewsByIdQuery {
  constructor(public readonly id: number) {}
}

export class CreateNewsItemCommand {
  constructor(
    public readonly title: string,
    public readonly summary: string,
    public readonly content: string,
    public readonly imageUrl: string | null,
    public readonly isPublished: boolean
  ) {}
}

export class UpdateNewsItemCommand {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly summary: string,
    public readonly content: string,
    public readonly imageUrl: string | null | undefined,
    public readonly removeImage: boolean,
    public readonly isPublished: boolean
  ) {}
}

export class DeleteNewsItemCommand {
  constructor(public readonly id: number) {}
}

export type GetNewsByIdResult = News | null;