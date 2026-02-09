import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedUser } from "../types/auth";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

/**
 * Require a valid JWT and attach the user payload to the request.
 */
export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header) {
    next({ status: 401, message: "Missing Authorization header" });
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    next({ status: 401, message: "Invalid authorization format" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    next({ status: 401, message: "Invalid or expired token" });
  }
}

/**
 * Attempt to attach a user from JWT; does not error if missing/invalid.
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header) {
    next();
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    req.user = undefined;
  }

  next();
}
