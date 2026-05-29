import { AutoWired, Service } from "@xtaskjs/core";
import { Controller, Get, Req, Res } from "@xtaskjs/common";
import { AllowAnonymous } from "@xtaskjs/security";
import type { Request, Response } from "express";
import { z } from "zod";
import {
  DEFAULT_SITE_LOCALE,
  SITE_LOCALE_COOKIE_NAME,
  resolveSupportedSiteLocale,
} from "../internationalization/site-locales";
import { LANGUAGE_SWITCH_PATH, normalizeLocaleRedirectTarget } from "./language-switch";
import { validateRequestData } from "./request-validation";

const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;

const trimString = (value: unknown): unknown =>
  typeof value === "string" ? value.trim() : value;

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

const languageSwitchQuerySchema = z.object({
  locale: z.preprocess(trimString, z.string().optional()),
  redirect: z.preprocess(trimString, z.string().optional()),
});

@Service()
@Controller()
export class LanguageSwitchController {
  @AllowAnonymous()
  @Get(LANGUAGE_SWITCH_PATH)
  async switchLanguage(@Req() req: Request, @Res() res: Response): Promise<void> {
    const query = await validateRequestData(languageSwitchQuerySchema, req.query);
    const locale = resolveSupportedSiteLocale(typeof query.locale === "string" ? query.locale : undefined) || DEFAULT_SITE_LOCALE;
    const redirectTarget = normalizeLocaleRedirectTarget(typeof query.redirect === "string" ? query.redirect : undefined);

    res.cookie(SITE_LOCALE_COOKIE_NAME, locale, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: shouldUseSecureCookies(req),
      maxAge: YEAR_IN_MS,
    });

    res.redirect(redirectTarget);
  }
}