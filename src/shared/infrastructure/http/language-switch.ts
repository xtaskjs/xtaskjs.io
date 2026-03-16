import { AppConfig } from "../config/app-config";

const LOCALE_QUERY_KEYS = ["locale", "lang", "language"] as const;

export const LANGUAGE_SWITCH_PATH = "/language/switch";

export const stripLocaleSearchParams = (targetUrl: URL): void => {
  for (const key of LOCALE_QUERY_KEYS) {
    targetUrl.searchParams.delete(key);
  }
};

export const normalizeLocaleRedirectTarget = (value?: string): string => {
  const fallback = "/";
  if (!value) {
    return fallback;
  }

  try {
    const publicUrl = new URL(AppConfig.publicUrl);
    const targetUrl = new URL(value, publicUrl);
    if (targetUrl.origin !== publicUrl.origin) {
      return fallback;
    }

    stripLocaleSearchParams(targetUrl);

    const search = targetUrl.searchParams.toString();
    return `${targetUrl.pathname}${search ? `?${search}` : ""}${targetUrl.hash}`;
  } catch {
    return fallback;
  }
};

export const buildLocaleSwitchHref = (requestUrl: string, locale: string): string => {
  const targetUrl = new URL(requestUrl || "/", AppConfig.publicUrl);
  stripLocaleSearchParams(targetUrl);

  const redirect = normalizeLocaleRedirectTarget(
    `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}` || "/"
  );

  const switchUrl = new URL(LANGUAGE_SWITCH_PATH, AppConfig.publicUrl);
  switchUrl.searchParams.set("locale", locale);
  switchUrl.searchParams.set("redirect", redirect);

  return `${switchUrl.pathname}?${switchUrl.searchParams.toString()}`;
};