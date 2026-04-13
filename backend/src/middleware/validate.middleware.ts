import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/error";

type ValidationTarget = "body" | "params" | "query";

export const validate = (schema: ZodSchema, target: ValidationTarget = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(", ");
      return next(new AppError(message || "Validation failed", 400));
    }

    req[target] = result.data;
    return next();
  };
};
