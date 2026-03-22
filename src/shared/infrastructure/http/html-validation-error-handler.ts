import type { NextFunction, Request, Response } from "express";
import { AppConfig } from "../config/app-config";
import { readLoginChallengeToken } from "../../../auth/domain/session";

const jsonwebtoken = require("jsonwebtoken") as {
  verify: (token: string, secret: string, options?: Record<string, unknown>) => Record<string, unknown>;
};

type ValidationPayload = {
  message?: string;
  errors?: Array<{
    property?: string;
    constraints?: string[];
    children?: Array<{
      property?: string;
      constraints?: string[];
    }>;
  }>;
};

type ValidationErrorLike = Error & {
  statusCode?: number;
  payload?: ValidationPayload;
};

type HtmlValidationHandler = (
  error: ValidationErrorLike,
  req: Request,
  res: Response,
  route: { method: string; path: string }
) => Promise<boolean>;

type RequestWithHtmlValidation = Request & {
  __xtaskHandleHtmlValidationError?: HtmlValidationHandler;
  auth?: { user?: Record<string, unknown>; roles?: string[] };
  user?: Record<string, unknown>;
  file?: Express.Multer.File;
};

const isValidationError = (error: ValidationErrorLike): boolean =>
  error.statusCode === 400 && error.payload?.message === "Validation failed";

const acceptsHtml = (req: Request): boolean => {
  if (typeof req.accepts === "function" && req.accepts("html")) {
    return true;
  }

  const accept = req.headers.accept;
  return typeof accept === "string" && accept.includes("text/html");
};

const isFormRequest = (req: Request): boolean => {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
};

const buildValidationMessage = (payload?: ValidationPayload): string => {
  for (const error of payload?.errors || []) {
    if (error.constraints?.[0]) {
      return error.constraints[0];
    }

    for (const child of error.children || []) {
      if (child.constraints?.[0]) {
        return child.constraints[0];
      }
    }
  }

  return "Please correct the highlighted fields and try again.";
};

const toNormalizedText = (value: unknown): string => String(value ?? "").trim();

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "on", "yes"].includes(value.toLowerCase());
  }

  return Boolean(value);
};

const buildViewer = (req: RequestWithHtmlValidation) => {
  const source = (req.auth?.user || req.user || {}) as Record<string, unknown>;
  const roleList = Array.isArray(req.auth?.roles)
    ? req.auth.roles.map((role) => String(role))
    : Array.isArray(source.roles)
      ? (source.roles as unknown[]).map((role) => String(role))
      : [];
  const role = roleList.includes("admin") || source.role === "admin" ? "admin" : "user";

  if (!source.email && !source.username && !source.fullName) {
    return null;
  }

  return {
    displayName: String(source.fullName || source.username || source.email || "Account"),
    username: String(source.username || ""),
    email: String(source.email || ""),
    role,
    isAdmin: role === "admin",
    accountHref: role === "admin" ? "/admin/users" : "/dashboard",
    accountLabel: role === "admin" ? "Admin Panel" : "Dashboard",
  };
};

const readChallengeEmail = (req: Request): string => {
  const token = readLoginChallengeToken(req);
  if (!token) {
    return "";
  }

  try {
    const payload = jsonwebtoken.verify(token, AppConfig.security.jwtSecret, {
      issuer: AppConfig.security.issuer,
    });

    return payload.typ === "login-challenge" ? String(payload.email || "") : "";
  } catch {
    return "";
  }
};

const renderValidationView = async (
  req: RequestWithHtmlValidation,
  res: Response,
  routePath: string,
  message: string
): Promise<boolean> => {
  const viewer = buildViewer(req);
  const body = (req.body || {}) as Record<string, unknown>;

  switch (routePath) {
    case "/login":
      await res.status(400).render("login", {
        title: "Log In",
        viewer: null,
        hasError: true,
        errorMessage: message,
        form: {
          identifier: toNormalizedText(body.identifier),
        },
      });
      return true;

    case "/admin/login":
      await res.status(400).render("admin-login", {
        title: "Admin Login",
        viewer: null,
        hasError: true,
        errorMessage: message,
        form: {
          username: toNormalizedText(body.username),
        },
      });
      return true;

    case "/register":
      await res.status(400).render("register", {
        title: "Create Account",
        viewer: null,
        hasError: true,
        errorMessage: message,
        form: {
          fullName: toNormalizedText(body.fullName),
          username: toNormalizedText(body.username),
          email: toNormalizedText(body.email),
          receiveNewsUpdates: toBoolean(body.receiveNewsUpdates),
          newsletterSubscribed: toBoolean(body.newsletterSubscribed),
        },
      });
      return true;

    case "/verify-email":
      await res.status(400).render("verify-email", {
        title: "Verify Email",
        viewer: null,
        email: toNormalizedText(body.email),
        code: toNormalizedText(body.code),
        hasError: true,
        errorMessage: message,
      });
      return true;

    case "/verify-email/resend":
      await res.status(400).render("verify-email", {
        title: "Verify Email",
        viewer: null,
        email: toNormalizedText(body.email),
        code: "",
        hasError: true,
        errorMessage: message,
      });
      return true;

    case "/login/verify":
      await res.status(400).render("login-two-factor", {
        title: "Two-Factor Verification",
        viewer: null,
        email: readChallengeEmail(req),
        hasError: true,
        errorMessage: message,
      });
      return true;

    case "/forgot-password":
      await res.status(400).render("forgot-password", {
        title: "Forgot Password",
        viewer: null,
        email: toNormalizedText(body.email),
        hasError: true,
        errorMessage: message,
      });
      return true;

    case "/reset-password":
      await res.status(400).render("reset-password", {
        title: "Reset Password",
        viewer: null,
        email: toNormalizedText(body.email),
        code: toNormalizedText(body.code),
        hasError: true,
        errorMessage: message,
      });
      return true;

    case "/admin/news":
      await res.status(400).render("admin-news-form", {
        title: "Create News",
        viewer,
        formTitle: "Create a News Item",
        action: "/admin/news",
        submitLabel: "Publish News",
        error: message,
        news: {
          title: toNormalizedText(body.title),
          summary: toNormalizedText(body.summary),
          content: toNormalizedText(body.content),
          isPublished: toBoolean(body.isPublished),
        },
      });
      return true;

    case "/admin/news/update":
      await res.status(400).render("admin-news-form", {
        title: "Edit News",
        viewer,
        formTitle: "Edit News Item",
        action: "/admin/news/update",
        submitLabel: "Save Changes",
        error: message,
        news: {
          id: Number(body.id || 0) || undefined,
          title: toNormalizedText(body.title),
          summary: toNormalizedText(body.summary),
          content: toNormalizedText(body.content),
          isPublished: toBoolean(body.isPublished),
        },
      });
      return true;

    case "/admin/users/role":
    case "/admin/users/status":
      res.redirect(`/admin/users?error=${encodeURIComponent(message)}`);
      return true;

    default:
      return false;
  }
};

export const attachHtmlValidationErrorHandler = (
  req: RequestWithHtmlValidation,
  _res: Response,
  next: NextFunction
): void => {
  req.__xtaskHandleHtmlValidationError = async (error, request, response, route) => {
    if (!isValidationError(error)) {
      return false;
    }

    if (!acceptsHtml(request) || !isFormRequest(request)) {
      return false;
    }

    return renderValidationView(
      request as RequestWithHtmlValidation,
      response,
      route.path,
      buildValidationMessage(error.payload)
    );
  };

  next();
};