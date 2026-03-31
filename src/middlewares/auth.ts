import type { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";

export enum UserRole {
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
  STUDENT = "STUDENT",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

export const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await betterAuth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!session.user.emailVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Email not verified" });
    }

    req.user = {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email || "",
      role: session.user.role || UserRole.STUDENT,
      emailVerified: session.user.emailVerified || false,
    };

    if (roles.length && !roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await betterAuth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (session && session.user) {
      req.user = {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role || UserRole.STUDENT,
        emailVerified: session.user.emailVerified || false,
      };
    }
  } catch (error) {
    // Silently continue if session check fails
  }

  next();
};
