import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { type NextFunction, type Request, type Response } from "express";
import { Logger } from "@xtaskjs/common";
import { AppConfig } from "../config/app-config";

mkdirSync(dirname(AppConfig.logging.filePath), { recursive: true });

const requestLogger = new Logger({
  appName: AppConfig.logging.appName,
  context: "HttpRequest",
  useColors: AppConfig.logging.useColors,
  file: {
    enabled: true,
    path: AppConfig.logging.filePath,
  },
});

const MAX_CORRELATION_LENGTH = 120;

const resolveCorrelationId = (request: Request): string => {
  const headerValue = request.headers[AppConfig.logging.correlationHeaderName];
  const firstValue = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (typeof firstValue === "string") {
    const normalized = firstValue.trim();
    if (normalized.length > 0) {
      return normalized.slice(0, MAX_CORRELATION_LENGTH);
    }
  }

  return randomUUID();
};

const formatStatusLevel = (statusCode: number): "info" | "warn" | "error" => {
  if (statusCode >= 500) {
    return "error";
  }

  if (statusCode >= 400) {
    return "warn";
  }

  return "info";
};

export const attachRequestCorrelationAndLogging = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = resolveCorrelationId(req);
  const headerName = AppConfig.logging.correlationHeaderName;
  const startedAt = Date.now();

  req.headers[headerName] = correlationId;
  (req as Request & { correlationId?: string }).correlationId = correlationId;
  res.locals.correlationId = correlationId;
  res.setHeader(headerName, correlationId);

  if (AppConfig.logging.requestLogEnabled) {
    requestLogger.info(`[${correlationId}] --> ${req.method} ${req.originalUrl || req.url}`);
  }

  res.on("finish", () => {
    if (!AppConfig.logging.requestLogEnabled) {
      return;
    }

    const elapsedMs = Date.now() - startedAt;
    const statusCode = res.statusCode;
    const message = `[${correlationId}] <-- ${req.method} ${req.originalUrl || req.url} ${statusCode} ${elapsedMs}ms`;
    const level = formatStatusLevel(statusCode);

    if (level === "error") {
      requestLogger.error(message);
      return;
    }

    if (level === "warn") {
      requestLogger.warn(message);
      return;
    }

    requestLogger.info(message);
  });

  next();
};
