import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from "@xtaskjs/cqrs";
import { AutoWired, Service } from "@xtaskjs/core";
import type { News } from "../../domain/news";
import { NewsReadService } from "../news-read.service";
import { NewsService } from "../news.service";
import {
  CreateNewsItemCommand,
  DeleteNewsItemCommand,
  GetAdminNewsPageQuery,
  GetAllPublishedNewsQuery,
  GetLatestPublishedNewsQuery,
  GetNewsByIdQuery,
  type GetNewsByIdResult,
  type GetNewsPageResult,
  UpdateNewsItemCommand,
} from "./news.messages";

@Service()
@QueryHandler(GetLatestPublishedNewsQuery)
export class GetLatestPublishedNewsHandler implements IQueryHandler<GetLatestPublishedNewsQuery, News[]> {
  @AutoWired({ qualifier: NewsReadService.name })
  private readonly newsReadService!: NewsReadService;

  async execute(query: GetLatestPublishedNewsQuery): Promise<News[]> {
    return this.newsReadService.getLatestPublished(query.limit);
  }
}

@Service()
@QueryHandler(GetAllPublishedNewsQuery)
export class GetAllPublishedNewsHandler implements IQueryHandler<GetAllPublishedNewsQuery, News[]> {
  @AutoWired({ qualifier: NewsReadService.name })
  private readonly newsReadService!: NewsReadService;

  async execute(): Promise<News[]> {
    return this.newsReadService.getAllPublished();
  }
}

@Service()
@QueryHandler(GetAdminNewsPageQuery)
export class GetAdminNewsPageHandler implements IQueryHandler<GetAdminNewsPageQuery, GetNewsPageResult> {
  @AutoWired({ qualifier: NewsReadService.name })
  private readonly newsReadService!: NewsReadService;

  async execute(query: GetAdminNewsPageQuery): Promise<GetNewsPageResult> {
    return this.newsReadService.getAdminPage({
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}

@Service()
@QueryHandler(GetNewsByIdQuery)
export class GetNewsByIdHandler implements IQueryHandler<GetNewsByIdQuery, GetNewsByIdResult> {
  @AutoWired({ qualifier: NewsReadService.name })
  private readonly newsReadService!: NewsReadService;

  async execute(query: GetNewsByIdQuery): Promise<GetNewsByIdResult> {
    return this.newsReadService.getById(query.id);
  }
}

@Service()
@CommandHandler(CreateNewsItemCommand)
export class CreateNewsItemHandler implements ICommandHandler<CreateNewsItemCommand, News> {
  @AutoWired({ qualifier: NewsService.name })
  private readonly newsService!: NewsService;

  async execute(command: CreateNewsItemCommand): Promise<News> {
    return this.newsService.create({
      title: command.title,
      summary: command.summary,
      content: command.content,
      imageUrl: command.imageUrl,
      isPublished: command.isPublished,
    });
  }
}

@Service()
@CommandHandler(UpdateNewsItemCommand)
export class UpdateNewsItemHandler implements ICommandHandler<UpdateNewsItemCommand, News> {
  @AutoWired({ qualifier: NewsService.name })
  private readonly newsService!: NewsService;

  async execute(command: UpdateNewsItemCommand): Promise<News> {
    return this.newsService.update({
      id: command.id,
      title: command.title,
      summary: command.summary,
      content: command.content,
      imageUrl: command.imageUrl,
      removeImage: command.removeImage,
      isPublished: command.isPublished,
    });
  }
}

@Service()
@CommandHandler(DeleteNewsItemCommand)
export class DeleteNewsItemHandler implements ICommandHandler<DeleteNewsItemCommand, void> {
  @AutoWired({ qualifier: NewsService.name })
  private readonly newsService!: NewsService;

  async execute(command: DeleteNewsItemCommand): Promise<void> {
    await this.newsService.delete(command.id);
  }
}