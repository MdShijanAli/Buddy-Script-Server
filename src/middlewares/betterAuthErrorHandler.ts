import type { Request, Response, NextFunction } from "express";
import { Roles } from "../../generated/prisma/enums";
import { generateTokens } from "../lib/tokens";

const VALID_ROLES = ["USER", "ADMIN"] as Roles[];

export function betterAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.method === "POST" && req.path.includes("/sign-up")) {
    const body = req.body;

    // Combine first_name and last_name into name if name is not provided
    if (!body.name && (body.first_name || body.last_name)) {
      body.name = `${body.first_name || ""} ${body.last_name || ""}`.trim();
    }

    if (body.role) {
      const upperRole = body.role.toUpperCase();

      if (!VALID_ROLES.includes(upperRole as any)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role provided",
          error: {
            code: "INVALID_ROLE",
            message: `Role must be one of: ${VALID_ROLES.map((r) => r.toLowerCase()).join(", ")}`,
            receivedRole: body.role,
          },
        });
      }

      req.body.role = upperRole;
    }
  }

  // Intercept response to add tokens
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Add tokens for successful auth responses (sign-up, sign-in)
    if (
      data &&
      typeof data === "object" &&
      data.user &&
      (req.path.includes("/sign-up") || req.path.includes("/sign-in"))
    ) {
      const tokens = generateTokens({
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role || "USER",
      });

      return originalJson({
        ...data,
        tokens,
      });
    }

    return originalJson(data);
  };

  next();
}

export function betterAuthErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("Better Auth Error:", {
    message: error.message,
    code: error.code,
    stack: error.stack,
    path: req.path,
    body: req.body,
  });

  // Handle validation errors
  if (error.message && error.message.includes("Invalid value for")) {
    const match = error.message.match(/Invalid value for (\w+)/);
    const field = match ? match[1] : "unknown field";

    return res.status(400).json({
      success: false,
      message: "Validation Error",
      error: {
        code: "VALIDATION_ERROR",
        field: field,
        message: error.message,
        hint:
          field === "role"
            ? `Role must be one of: ${VALID_ROLES.map((r) => r.toLowerCase()).join(", ")}`
            : undefined,
      },
    });
  }

  if (error.code === "FAILED_TO_CREATE_USER") {
    return res.status(400).json({
      success: false,
      message: "Failed to create user",
      error: {
        code: error.code,
        message: error.message || "User creation failed",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }

  next(error);
}
