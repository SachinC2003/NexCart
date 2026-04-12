import { Request, Response } from "express";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieHeader = (req: Request) => req.headers.cookie ?? "";

export interface SessionStoreEntry {
  sessionId: string;
  userId: number;
  deviceName: string;
  browser: string;
  os: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}

const sessionStore = new Map<string, SessionStoreEntry>();

export const getCookieValue = (req: Request, cookieName: string) => {
  const cookieHeader = getCookieHeader(req);

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
};

export const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  };
};

const matchUserAgent = (userAgent: string, checks: Array<[RegExp, string]>, fallback: string) => {
  const found = checks.find(([pattern]) => pattern.test(userAgent));
  return found ? found[1] : fallback;
};

export const getClientIpAddress = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.socket.remoteAddress ?? "";
};

export const getDeviceDetails = (req: Request) => {
  const userAgent = req.headers["user-agent"] ?? "";
  const browser = matchUserAgent(
    userAgent,
    [
      [/Edg\//i, "Edge"],
      [/Chrome\//i, "Chrome"],
      [/Firefox\//i, "Firefox"],
      [/Safari\//i, "Safari"],
    ],
    "Unknown Browser"
  );

  const os = matchUserAgent(
    userAgent,
    [
      [/Windows/i, "Windows"],
      [/Android/i, "Android"],
      [/iPhone|iPad|iPod/i, "iOS"],
      [/Mac OS X|Macintosh/i, "macOS"],
      [/Linux/i, "Linux"],
    ],
    "Unknown OS"
  );

  const bodyDeviceName =
    typeof req.body?.deviceName === "string" && req.body.deviceName.trim().length > 0
      ? req.body.deviceName.trim()
      : null;

  return {
    browser,
    os,
    userAgent,
    ipAddress: getClientIpAddress(req),
    deviceName: bodyDeviceName ?? `${browser} on ${os}`,
  };
};

export const getRefreshTokenExpiryDate = () => new Date(Date.now() + SEVEN_DAYS_MS);

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken", {
    ...getRefreshCookieOptions(),
    maxAge: undefined,
  });
};

export const createSessionStoreEntry = (
  sessionId: string,
  userId: number,
  expiresAt: Date,
  details: Pick<SessionStoreEntry, 'deviceName' | 'browser' | 'os' | 'userAgent' | 'ipAddress'>
) => {
  const entry: SessionStoreEntry = {
    sessionId,
    userId,
    expiresAt,
    lastUsedAt: new Date(),
    isActive: true,
    ...details,
  };

  sessionStore.set(sessionId, entry);
  return entry;
};

export const getSessionStoreEntry = (sessionId: string) => {
  return sessionStore.get(sessionId) ?? null;
};

export const updateSessionStoreEntry = (sessionId: string, updates: Partial<Omit<SessionStoreEntry, 'sessionId' | 'userId'>>) => {
  const existing = sessionStore.get(sessionId);
  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...updates,
  };

  sessionStore.set(sessionId, updated);
  return updated;
};

export const revokeSessionStoreEntry = (sessionId: string) => {
  sessionStore.delete(sessionId);
};

export const revokeUserSessionStoreEntries = (userId: number) => {
  for (const [sessionId, entry] of sessionStore.entries()) {
    if (entry.userId === userId) {
      sessionStore.delete(sessionId);
    }
  }
};
