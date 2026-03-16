import Handlebars from "handlebars";
import { InternationalizationService } from "@xtaskjs/internationalization";

const internationalization = new InternationalizationService();

const toTranslateOptions = (hash?: Record<string, unknown>) => {
  const { count, locale, fallbackLocale, namespace, defaultValue, ...params } = hash || {};
  const options: Record<string, unknown> = {
    locale,
    fallbackLocale,
    namespace,
    defaultValue,
  };

  if (typeof count === "number") {
    options.count = count;
  } else if (typeof count === "string" && count.trim() !== "" && Number.isFinite(Number(count))) {
    options.count = Number(count);
  }

  if (Object.keys(params).length > 0) {
    options.params = params;
  }

  return options;
};

export const handlebarsHelpers = {
  gt: (a: number, b: number): boolean => a > b,
  ne: (a: unknown, b: unknown): boolean => a !== b,
  eq: (a: unknown, b: unknown): boolean => a === b,
  ternary: (condition: unknown, whenTrue: unknown, whenFalse: unknown): unknown =>
    condition ? whenTrue : whenFalse,
  t: (key: string, options: Handlebars.HelperOptions): string => {
    return internationalization.t(key, toTranslateOptions(options.hash));
  },
  formatDate: (value: Date | string | number, options: Handlebars.HelperOptions): string => {
    try {
      return internationalization.formatDate(value, options.hash || {});
    } catch {
      return "";
    }
  },
  formatDateTime: (value: Date | string | number, options: Handlebars.HelperOptions): string => {
    try {
      return internationalization.formatDateTime(value, options.hash || {});
    } catch {
      return "";
    }
  },
  safeString: (value: string): Handlebars.SafeString => new Handlebars.SafeString(value),
};
