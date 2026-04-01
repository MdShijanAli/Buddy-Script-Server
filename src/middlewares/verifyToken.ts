import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/tokens";

export interface IAuthUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * Verify JWT access token middleware
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    (req.cookies?.accessToken as string) ||
    null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
      code: "UNAUTHORIZED",
    });
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "TOKEN_INVALID",
    });
  }

  (req as any).user = payload;
  next();
}

/**
 * Optional token verification - doesn't fail if token is missing
 */
export function optionalVerifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    (req.cookies?.accessToken as string) ||
    null;

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      (req as any).user = payload;
    }
  }

  next();
}
