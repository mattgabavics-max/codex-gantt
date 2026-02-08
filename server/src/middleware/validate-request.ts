import { validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";

export function validateRequest(req: Request, _res: Response, next: NextFunction) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  next({
    status: 400,
    message: "Validation failed",
    details: result.array({ onlyFirstError: true })
  });
}
