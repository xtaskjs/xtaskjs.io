import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Controller, Get, Post, Req, Res } from "@xtaskjs/common";
import { CommandBus, InjectCommandBus, InjectQueryBus, QueryBus } from "@xtaskjs/cqrs";
import { view } from "@xtaskjs/express-http";
import { Authenticated, Roles } from "@xtaskjs/security";
import { z } from "zod";
import {
  CreateNewsItemCommand,
  DeleteNewsItemCommand,
  GetAdminNewsPageQuery,
  GetNewsByIdQuery,
  type GetNewsPageResult,
  UpdateNewsItemCommand,
} from "../../application/cqrs/news.messages";
import { normalizeText, toNewsViewModel } from "../../../shared/infrastructure/http/view-helpers";
import { UploadsService } from "../../../shared/infrastructure/http/uploads.service";
import { SessionViewService } from "../../../auth/application/session-view.service";
import { validateRequestData } from "../../../shared/infrastructure/http/request-validation";
import type { News } from "../../domain/news";

const PAGE_SIZE = 8;

const trimString = (value: unknown): unknown =>
  typeof value === "string" ? value.trim() : value;

const parseBooleanValue = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
};

const adminNewsListQuerySchema = z.object({
  q: z.preprocess(trimString, z.string().optional()),
  page: z.coerce.number().int().min(1).optional(),
  message: z.preprocess(trimString, z.string().optional()),
});

const adminNewsEditQuerySchema = z.object({
  id: z.coerce.number().int().min(1),
});

const createNewsBodySchema = z.object({
  title: z.preprocess(trimString, z.string().min(1)),
  summary: z.preprocess(trimString, z.string().min(1)),
  content: z.preprocess(trimString, z.string().min(1)),
  isPublished: z.preprocess((value) => parseBooleanValue(value), z.boolean()).optional(),
});

const updateNewsBodySchema = createNewsBodySchema.extend({
  id: z.coerce.number().int().min(1),
  removeImage: z.preprocess((value) => parseBooleanValue(value), z.boolean()).optional(),
});

const deleteNewsBodySchema = z.object({
  id: z.coerce.number().int().min(1),
});

const buildPages = (total: number, pageSize: number, currentPage: number) => {
  const totalPages = Math.ceil(total / pageSize);
  return {
    totalPages,
    pages: Array.from({ length: totalPages }, (_, index) => ({
      number: index + 1,
      isCurrent: index + 1 === currentPage,
    })),
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    prevPage: currentPage - 1,
    nextPage: currentPage + 1,
  };
};

@Service()
@Controller("/admin/news")
@Authenticated("app-session")
@Roles("admin")
export class AdminNewsController {
  @InjectQueryBus()
  private readonly queryBus!: QueryBus;

  @InjectCommandBus()
  private readonly commandBus!: CommandBus;

  @AutoWired({ qualifier: UploadsService.name })
  private readonly uploadsService!: UploadsService;

  @AutoWired({ qualifier: SessionViewService.name })
  private readonly sessionViewService!: SessionViewService;

  @Get("/")
  async list(@Req() req: Request, @Res() res: Response): Promise<ReturnType<typeof view>> {
    const query = await validateRequestData(adminNewsListQuerySchema, req.query);
    const search = normalizeText(query.q);
    const page = Math.max(1, query.page ?? 1);

    const result = await this.queryBus.execute<GetNewsPageResult>(
      new GetAdminNewsPageQuery(search, page, PAGE_SIZE)
    );
    const pagination = buildPages(result.total, PAGE_SIZE, page);

    return view("admin-news-list", {
      titleKey: "admin.news.metaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      news: result.items.map((entry) => toNewsViewModel(entry)),
      message: query.message,
      search,
      page,
      total: result.total,
      ...pagination,
    });
  }

  @Get("/new")
  async createPage(@Req() req: Request, @Res() res: Response): Promise<ReturnType<typeof view>> {
    return view("admin-news-form", {
      titleKey: "admin.news.form.createMetaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      action: "/admin/news",
      news: { title: "", summary: "", content: "", isPublished: true },
    });
  }

  @Post("/")
  async create(@Req() req: Request, @Res() res: Response): Promise<ReturnType<typeof view> | void> {
    const body = await validateRequestData(createNewsBodySchema, req.body);
    const title = normalizeText(body.title);
    const summary = normalizeText(body.summary);
    const content = normalizeText(body.content);
    const isPublished = parseBooleanValue(body.isPublished);

    if (!title || !summary || !content) {
      return view(
        "admin-news-form",
        {
          titleKey: "admin.news.form.createMetaTitle",
          viewer: await this.sessionViewService.getViewer(req, res),
          action: "/admin/news",
          errorMessageKey: "admin.news.form.allFieldsRequired",
          news: { title, summary, content, isPublished },
        },
        400
      );
    }

    const imageUrl = this.uploadsService.toImageUrl(req.file);
    await this.commandBus.execute(
      new CreateNewsItemCommand(title, summary, content, imageUrl, isPublished)
    );
    res.redirect("/admin/news?message=created");
  }

  @Get("/edit")
  async editPage(@Req() req: Request, @Res() res: Response): Promise<ReturnType<typeof view> | void> {
    const query = await validateRequestData(adminNewsEditQuerySchema, req.query);
    const news = await this.queryBus.execute<News | null>(new GetNewsByIdQuery(query.id));

    if (!news) {
      res.status(404).send("News not found");
      return;
    }

    return view("admin-news-form", {
      titleKey: "admin.news.form.editMetaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      action: "/admin/news/update",
      news,
    });
  }

  @Post("/update")
  async update(@Req() req: Request, @Res() res: Response): Promise<ReturnType<typeof view> | void> {
    const body = await validateRequestData(updateNewsBodySchema, req.body);
    const { id } = body;
    const title = normalizeText(body.title);
    const summary = normalizeText(body.summary);
    const content = normalizeText(body.content);
    const isPublished = parseBooleanValue(body.isPublished);

    if (!title || !summary || !content) {
      return view(
        "admin-news-form",
        {
          titleKey: "admin.news.form.editMetaTitle",
          viewer: await this.sessionViewService.getViewer(req, res),
          action: "/admin/news/update",
          errorMessageKey: "admin.news.form.allFieldsRequired",
          news: { id, title, summary, content, isPublished },
        },
        400
      );
    }

    const imageUrl = this.uploadsService.toOptionalImageUrl(req.file);
    const removeImage = parseBooleanValue(body.removeImage);

    await this.commandBus.execute(
      new UpdateNewsItemCommand(id, title, summary, content, imageUrl, removeImage, isPublished)
    );
    res.redirect("/admin/news?message=updated");
  }

  @Post("/delete")
  async delete(@Req() req: Request, @Res() res: Response): Promise<void> {
    const body = await validateRequestData(deleteNewsBodySchema, req.body);
    await this.commandBus.execute(new DeleteNewsItemCommand(body.id));
    res.redirect("/admin/news?message=deleted");
  }
}