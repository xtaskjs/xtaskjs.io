import type { NextFunction, Request, Response } from "express";
import { getInternationalizationLifecycleManager } from "@xtaskjs/internationalization";
import { AppConfig } from "../config/app-config";
import {
  DEFAULT_SITE_LOCALE,
  SITE_LOCALE_COOKIE_NAME,
  SITE_LOCALES,
  resolveSupportedSiteLocale,
  toHtmlLang,
} from "../internationalization/site-locales";
import { buildLocaleSwitchHref } from "./language-switch";

const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;

const shouldUseSecureCookies = (req: Request): boolean => {
  if (req.secure) {
    return true;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (Array.isArray(forwardedProto)) {
    return forwardedProto.some((value) => String(value).split(",").some((item) => item.trim() === "https"));
  }

  return typeof forwardedProto === "string" && forwardedProto.split(",").some((value) => value.trim() === "https");
};

const resolveRequestedLocale = (req: Request): string | undefined => {
  const query = req.query as Record<string, unknown>;
  const value = query.locale || query.lang || query.language;
  return resolveSupportedSiteLocale(typeof value === "string" ? value : undefined);
};

export const attachInternationalizationRequestState = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Promise.resolve()
    .then(async () => {
      const requestedLocale = resolveRequestedLocale(req);
      if (requestedLocale) {
        res.cookie(SITE_LOCALE_COOKIE_NAME, requestedLocale, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: shouldUseSecureCookies(req),
          maxAge: YEAR_IN_MS,
        });
      }

      const lifecycleManager = getInternationalizationLifecycleManager();
      const context = await lifecycleManager.resolveRequestContext(req);
      const currentLocale = resolveSupportedSiteLocale(context.locale) || DEFAULT_SITE_LOCALE;

      res.locals.currentLocale = currentLocale;
      res.locals.htmlLang = toHtmlLang(currentLocale);
      res.locals.localeOptions = SITE_LOCALES.map((definition) => ({
        ...definition,
        href: buildLocaleSwitchHref(req.originalUrl || req.url || "/", definition.locale),
        isCurrent: definition.locale === currentLocale,
      }));
    })
    .then(() => next())
    .catch(next);
};