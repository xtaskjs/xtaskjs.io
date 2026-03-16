import { normalizeLocaleTag } from "@xtaskjs/internationalization";

export const SITE_LOCALE_COOKIE_NAME = "xtask_locale";
export const DEFAULT_SITE_LOCALE = "en-US";

export const SITE_LOCALES = [
  {
    locale: "en-US",
    label: "English",
    shortLabel: "EN",
  },
  {
    locale: "es-ES",
    label: "Español",
    shortLabel: "ES",
  },
] as const;

const localeLookup = new Map(
  SITE_LOCALES.map((definition) => [definition.locale.toLowerCase(), definition.locale])
);

const baseLanguageLookup = new Map(
  SITE_LOCALES.map((definition) => [definition.locale.split("-")[0]!.toLowerCase(), definition.locale])
);

export const resolveSupportedSiteLocale = (value?: string): string | undefined => {
  const normalizedLocale = normalizeLocaleTag(value);
  if (!normalizedLocale) {
    return undefined;
  }

  const exactMatch = localeLookup.get(normalizedLocale.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }

  return baseLanguageLookup.get(normalizedLocale.split("-")[0]!.toLowerCase());
};

export const parseCookieHeader = (value?: string | string[]): Record<string, string> => {
  const cookieHeader = Array.isArray(value) ? value.join("; ") : value;
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .reduce<Record<string, string>>((cookies, entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex <= 0) {
        return cookies;
      }

      const name = entry.slice(0, separatorIndex).trim();
      const rawValue = entry.slice(separatorIndex + 1).trim();
      cookies[name] = decodeURIComponent(rawValue);
      return cookies;
    }, {});
};

export const readSiteLocaleCookie = (request?: { headers?: Record<string, unknown> }): string | undefined => {
  const cookies = parseCookieHeader(request?.headers?.cookie as string | string[] | undefined);
  return resolveSupportedSiteLocale(cookies[SITE_LOCALE_COOKIE_NAME]);
};

export const toHtmlLang = (locale?: string): string => {
  const resolvedLocale = resolveSupportedSiteLocale(locale) || DEFAULT_SITE_LOCALE;
  return resolvedLocale.split("-")[0] || "en";
};