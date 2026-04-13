import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "../utils/error";

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== "admin") {
    return next(new AppError("Forbidden", 403));
  }

  return next();
};
