import { AutoWired, Service } from "@xtaskjs/core";
import { Controller, Get, Query, Req, Res } from "@xtaskjs/common";
import { AllowAnonymous } from "@xtaskjs/security";
import type { Request, Response } from "express";
import { IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import {
  DEFAULT_SITE_LOCALE,
  SITE_LOCALE_COOKIE_NAME,
  resolveSupportedSiteLocale,
} from "../internationalization/site-locales";
import { LANGUAGE_SWITCH_PATH, normalizeLocaleRedirectTarget } from "./language-switch";

const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;

const trimString = ({ value }: { value: unknown }): unknown =>
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

class LanguageSwitchQueryDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  locale?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  redirect?: string;
}

@Service()
@Controller()
export class LanguageSwitchController {
  @AllowAnonymous()
  @Get(LANGUAGE_SWITCH_PATH)
  switchLanguage(@Query() query: LanguageSwitchQueryDto, @Req() req: Request, @Res() res: Response): void {
    const locale = resolveSupportedSiteLocale(query.locale) || DEFAULT_SITE_LOCALE;
    const redirectTarget = normalizeLocaleRedirectTarget(query.redirect);

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