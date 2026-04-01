import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, isTokenBlacklisted } from "../lib/tokens";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Missing or invalid token",
          code: "MISSING_TOKEN",
        });
      }

      const token = authHeader.slice(7); // Remove "Bearer " prefix
      const payload = verifyAccessToken(token);

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
          code: "INVALID_TOKEN",
        });
      }

      // Check if token is blacklisted
      const blacklisted = await isTokenBlacklisted(token);
      if (blacklisted) {
        return res.status(401).json({
          success: false,
          message: "Token has been revoked",
          code: "TOKEN_REVOKED",
        });
      }

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      // Check role if specified
      if (roles.length && !roles.includes(payload.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          code: "FORBIDDEN",
        });
      }

      next();
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
        code: "AUTH_ERROR",
      });
    }
  };
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = verifyAccessToken(token);

      if (payload) {
        const blacklisted = await isTokenBlacklisted(token);
        if (!blacklisted) {
          req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
          };
        }
      }
    }
  } catch (error) {
    // Silently continue if token check fails
  }

  next();
};
