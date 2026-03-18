import { AutoWired, Service } from "@xtaskjs/core";
import { CacheModel, Cacheable } from "@xtaskjs/cache";
import { AppConfig } from "../../shared/infrastructure/config/app-config";
import {
  DocumentationArchitectureViewModel,
  DocumentationCliViewModel,
  DocumentationDecoratorsViewModel,
  DocumentationHubViewModel,
  DocumentationPackageDetailViewModel,
  DocumentationPackagesViewModel,
  DocumentationSamplesViewModel,
  DocumentationService,
} from "./documentation.service";

@CacheModel({
  name: "documentation-pages",
  driver: "redis",
  ttl: AppConfig.cache.documentationTtl,
  namespace: AppConfig.cache.namespace,
  prefix: "documentation-pages",
})
export class DocumentationPageCacheModel {}

@Service()
export class DocumentationCacheService {
  @AutoWired({ qualifier: DocumentationService.name })
  private readonly documentationService!: DocumentationService;

  @Cacheable({ model: DocumentationPageCacheModel, key: (locale: string) => `hub:${locale}` })
  async getHubViewModel(locale: string): Promise<DocumentationHubViewModel> {
    return this.documentationService.getHubViewModel();
  }

  @Cacheable({ model: DocumentationPageCacheModel, key: (locale: string) => `architecture:${locale}` })
  async getArchitectureViewModel(locale: string): Promise<DocumentationArchitectureViewModel> {
    return this.documentationService.getArchitectureViewModel();
  }

  @Cacheable({ model: DocumentationPageCacheModel, key: (locale: string) => `packages:${locale}` })
  async getPackagesViewModel(locale: string): Promise<DocumentationPackagesViewModel> {
    return this.documentationService.getPackagesViewModel();
  }

  @Cacheable({ model: DocumentationPageCacheModel, key: (locale: string) => `cli:${locale}` })
  async getCliViewModel(locale: string): Promise<DocumentationCliViewModel> {
    return this.documentationService.getCliViewModel();
  }

  @Cacheable({
    model: DocumentationPageCacheModel,
    key: (locale: string, slug: string) => `package:${locale}:${slug}`,
    unless: (result) => result === undefined,
  })
  async getPackageDetailViewModel(
    locale: string,
    slug: string
  ): Promise<DocumentationPackageDetailViewModel | undefined> {
    return this.documentationService.getPackageDetailViewModel(slug);
  }

  @Cacheable({ model: DocumentationPageCacheModel, key: (locale: string) => `samples:${locale}` })
  async getSamplesViewModel(locale: string): Promise<DocumentationSamplesViewModel> {
    return this.documentationService.getSamplesViewModel();
  }

  @Cacheable({ model: DocumentationPageCacheModel, key: (locale: string) => `decorators:${locale}` })
  async getDecoratorsViewModel(locale: string): Promise<DocumentationDecoratorsViewModel> {
    return this.documentationService.getDecoratorsViewModel();
  }
}
