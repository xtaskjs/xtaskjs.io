export const SESSION_COOKIE_NAME = "xtask_session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 8;
export const LOGIN_CHALLENGE_COOKIE_NAME = "xtask_login_challenge";
export const LOGIN_CHALLENGE_MAX_AGE_MS = 1000 * 60 * 10;

const readCookieValue = (request: { headers?: Record<string, unknown> }, name: string): string | null => {
  const header = request.headers?.cookie;
  if (typeof header !== "string" || header.length === 0) {
    return null;
  }

  for (const part of header.split(";")) {
    const [cookieName, ...rest] = part.trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
};

export const readSessionToken = (request: { headers?: Record<string, unknown> }): string | null => {
  return readCookieValue(request, SESSION_COOKIE_NAME);
};

export const readLoginChallengeToken = (request: { headers?: Record<string, unknown> }): string | null => {
  return readCookieValue(request, LOGIN_CHALLENGE_COOKIE_NAME);
};
