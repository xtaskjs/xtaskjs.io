import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Controller, Get } from "@xtaskjs/common";
import { view } from "@xtaskjs/express-http";
import { NewsService } from "../../application/news.service";
import { toNewsViewModel } from "../../../shared/infrastructure/http/view-helpers";
import { SessionViewService } from "../../../auth/application/session-view.service";
import { NpmPackageCatalogService } from "../../../packages/application/npm-package-catalog.service";

@Service()
@Controller()
export class PublicSiteController {
  @AutoWired({ qualifier: NewsService.name })
  private readonly newsService!: NewsService;

  @AutoWired({ qualifier: SessionViewService.name })
  private readonly sessionViewService!: SessionViewService;

  @AutoWired({ qualifier: NpmPackageCatalogService.name })
  private readonly npmPackageCatalogService!: NpmPackageCatalogService;

  @Get("/")
  async home(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    const latestNews = await this.newsService.getLatestPublished(3);
    const projectPackages = await this.npmPackageCatalogService.listPublishedPackages();

    return view("home", {
      titleKey: "site.home.metaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      projectPackages,
      latestNews: latestNews.map((entry) => toNewsViewModel(entry)),
    });
  }

  @Get("/news")
  async news(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    const allNews = await this.newsService.getAllPublished();

    return view("news", {
      titleKey: "site.news.metaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      news: allNews.map((entry) => toNewsViewModel(entry)),
    });
  }

  @Get("/health")
  health(): { status: string } {
    return { status: "ok" };
  }
}