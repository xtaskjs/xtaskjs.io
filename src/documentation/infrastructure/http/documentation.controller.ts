import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Controller, Get } from "@xtaskjs/common";
import { CacheView, VaryBy } from "@xtaskjs/cache";
import { view } from "@xtaskjs/express-http";
import { AppConfig } from "../../../shared/infrastructure/config/app-config";
import { DocumentationCacheService } from "../../application/documentation-cache.service";
import { SessionViewService } from "../../../auth/application/session-view.service";

@Service()
@Controller("/documentation")
@CacheView({
  visibility: "private",
  maxAge: AppConfig.cache.documentationHttpMaxAge,
  etag: true,
})
@VaryBy("accept-language", "cookie")
export class DocumentationController {
  @AutoWired({ qualifier: DocumentationCacheService.name })
  private readonly documentationService!: DocumentationCacheService;

  @AutoWired({ qualifier: SessionViewService.name })
  private readonly sessionViewService!: SessionViewService;

  private resolveLocale(res: Response): string {
    return typeof res.locals.currentLocale === "string" ? res.locals.currentLocale : "en-US";
  }

  @Get("/")
  async documentation(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation", {
      ...(await this.documentationService.getHubViewModel(this.resolveLocale(res))),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/architecture")
  async architecture(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view(
      "documentation-architecture",
      {
        ...(await this.documentationService.getArchitectureViewModel(this.resolveLocale(res))),
        viewer: await this.sessionViewService.getViewer(req, res),
      }
    );
  }

  @Get("/packages")
  async packages(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation-packages", {
      ...(await this.documentationService.getPackagesViewModel(this.resolveLocale(res))),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/cli")
  async cli(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation-cli", {
      ...(await this.documentationService.getCliViewModel(this.resolveLocale(res))),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/packages/:slug")
  async packageDetail(req: Request, res: Response): Promise<ReturnType<typeof view> | void> {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const detailViewModel = await this.documentationService.getPackageDetailViewModel(
      this.resolveLocale(res),
      slug
    );

    if (!detailViewModel) {
      res.status(404).send("Package not found");
      return;
    }

    return view("documentation-package-detail", {
      ...detailViewModel,
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/decorators")
  async decorators(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation-decorators", {
      ...(await this.documentationService.getDecoratorsViewModel(this.resolveLocale(res))),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/samples")
  async samples(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation-samples", {
      ...(await this.documentationService.getSamplesViewModel(this.resolveLocale(res))),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }
}