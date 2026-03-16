import type { Socket } from "net";
import { isIP } from "net";
import geoip from "geoip-lite";
import type { AccessLocationSnapshot } from "../../../users/domain/access-location";

type RequestLike = {
  readonly headers?: Record<string, unknown>;
  readonly socket?: Pick<Socket, "remoteAddress">;
};

const countryNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

const nullLocationSnapshot = (userAgent: string | null): AccessLocationSnapshot => ({
  ipAddress: null,
  countryCode: null,
  countryName: null,
  region: null,
  city: null,
  locationLabel: null,
  userAgent,
});

const readHeader = (headers: Record<string, unknown> | undefined, name: string): string | undefined => {
  if (!headers) {
    return undefined;
  }

  const value = headers[name];
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(",");
  }

  return typeof value === "string" ? value : undefined;
};

const cleanForwardedToken = (value: string): string => {
  const trimmed = value.trim().replace(/^for=/i, "").replace(/^"|"$/g, "");
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    return end >= 0 ? trimmed.slice(1, end) : trimmed;
  }

  const colonCount = trimmed.split(":").length - 1;
  if (colonCount === 1 && trimmed.includes(".")) {
    return trimmed.slice(0, trimmed.lastIndexOf(":"));
  }

  return trimmed;
};

const resolveForwardedIp = (headers: Record<string, unknown> | undefined): string | null => {
  const forwardedFor = readHeader(headers, "x-forwarded-for");
  if (forwardedFor) {
    const candidate = cleanForwardedToken(forwardedFor.split(",")[0] || "");
    if (candidate) {
      return candidate;
    }
  }

  const forwarded = readHeader(headers, "forwarded");
  if (!forwarded) {
    return null;
  }

  for (const part of forwarded.split(",")) {
    for (const token of part.split(";")) {
      const candidate = cleanForwardedToken(token);
      if (candidate && token.trim().toLowerCase().startsWith("for=")) {
        return candidate;
      }
    }
  }

  return null;
};

const normalizeIpAddress = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = cleanForwardedToken(value);
  if (!trimmed || trimmed.toLowerCase() === "unknown") {
    return null;
  }

  if (trimmed.startsWith("::ffff:")) {
    const mapped = trimmed.slice(7);
    return isIP(mapped) ? mapped : null;
  }

  return isIP(trimmed) ? trimmed : null;
};

const resolveCountryName = (countryCode: string | null): string | null => {
  if (!countryCode) {
    return null;
  }

  return countryNames?.of(countryCode) || countryCode;
};

const buildLocationLabel = (city: string | null, region: string | null, countryName: string | null): string | null => {
  const parts = [city, region, countryName].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length > 0 ? Array.from(new Set(parts)).join(", ") : null;
};

export const resolveRequestAccessLocation = (request: RequestLike): AccessLocationSnapshot => {
  const userAgentHeader = readHeader(request.headers, "user-agent");
  const userAgent = userAgentHeader?.trim() || null;
  const ipAddress =
    normalizeIpAddress(resolveForwardedIp(request.headers)) || normalizeIpAddress(request.socket?.remoteAddress);

  if (!ipAddress) {
    return nullLocationSnapshot(userAgent);
  }

  const lookup = geoip.lookup(ipAddress);
  const countryCode = lookup?.country || null;
  const countryName = resolveCountryName(countryCode);
  const region = lookup?.region || null;
  const city = lookup?.city || null;

  return {
    ipAddress,
    countryCode,
    countryName,
    region,
    city,
    locationLabel: buildLocationLabel(city, region, countryName),
    userAgent,
  };
};