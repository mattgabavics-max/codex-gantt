import type { NextFunction, Request, Response } from "express";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function errorHandler(
  err: ApiError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if ("status" in err) {
    res.status(err.status).json({
      error: err.message,
      details: err.details ?? null
    });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
