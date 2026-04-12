import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token";
import type { File } from "multer";
import { AppError } from "../utils/error";
import { getCookieValue, getSessionStoreEntry, revokeSessionStoreEntry, updateSessionStoreEntry } from "../utils/session";
import { findUserById } from "../repositories/user.Repository";

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    file?: File;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization as string | undefined;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || typeof decoded === "string" || !decoded.sessionId) {
      return next(new AppError("Unauthorized", 401));
    }

    const refreshTokenValue = getCookieValue(req, "refreshToken");

    if (!refreshTokenValue) {
      return next(new AppError("Unauthorized", 401));
    }

    const refreshDecoded = verifyRefreshToken(refreshTokenValue);

    if (
      !refreshDecoded ||
      typeof refreshDecoded === "string" ||
      refreshDecoded.sessionId !== decoded.sessionId ||
      refreshDecoded.id !== decoded.id
    ) {
      return next(new AppError("Unauthorized", 401));
    }

    const sessionEntry = getSessionStoreEntry(decoded.sessionId);

    if (
      !sessionEntry ||
      sessionEntry.userId !== decoded.id ||
      !sessionEntry.isActive ||
      sessionEntry.expiresAt.getTime() <= Date.now()
    ) {
      return next(new AppError("Unauthorized", 401));
    }

    findUserById(decoded.id)
      .then((user) => {
        if (!user || !user.isActive) {
          revokeSessionStoreEntry(decoded.sessionId);
          return next(new AppError("Unauthorized", 401));
        }

        updateSessionStoreEntry(decoded.sessionId, { lastUsedAt: new Date() });
        req.userId = decoded.id;
        req.userRole = user.role;
        next();
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
}
