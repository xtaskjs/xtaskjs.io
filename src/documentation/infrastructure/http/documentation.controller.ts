import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Controller, Get } from "@xtaskjs/common";
import { view } from "@xtaskjs/express-http";
import { DocumentationService } from "../../application/documentation.service";
import { SessionViewService } from "../../../auth/application/session-view.service";

@Service()
@Controller("/documentation")
export class DocumentationController {
  @AutoWired({ qualifier: DocumentationService.name })
  private readonly documentationService!: DocumentationService;

  @AutoWired({ qualifier: SessionViewService.name })
  private readonly sessionViewService!: SessionViewService;

  @Get("/")
  async documentation(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation", {
      ...this.documentationService.getHubViewModel(),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/architecture")
  async architecture(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view(
      "documentation-architecture",
      {
        ...this.documentationService.getArchitectureViewModel(),
        viewer: await this.sessionViewService.getViewer(req, res),
      }
    );
  }

  @Get("/packages")
  async packages(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation-packages", {
      ...this.documentationService.getPackagesViewModel(),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/packages/:slug")
  async packageDetail(req: Request, res: Response): Promise<ReturnType<typeof view> | void> {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const detailViewModel = this.documentationService.getPackageDetailViewModel(slug);

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
      ...this.documentationService.getDecoratorsViewModel(),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }

  @Get("/samples")
  async samples(req: Request, res: Response): Promise<ReturnType<typeof view>> {
    return view("documentation-samples", {
      ...this.documentationService.getSamplesViewModel(),
      viewer: await this.sessionViewService.getViewer(req, res),
    });
  }
}