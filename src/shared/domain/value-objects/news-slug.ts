import { StringValueObject } from "@xtaskjs/value-objects";

const slugify = (text: string): string =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

export class NewsSlug extends StringValueObject {
  constructor(value: string) {
    const normalized = slugify(value);

    if (!normalized) {
      throw new Error("News slug cannot be empty");
    }

    super(normalized);
  }

  static fromTitle(title: string): NewsSlug {
    return new NewsSlug(title);
  }
}