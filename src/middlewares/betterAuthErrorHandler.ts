import type { Request, Response, NextFunction } from "express";
import { Roles } from "../../generated/prisma/enums";

const VALID_ROLES = ["ADMIN", "TUTOR", "STUDENT"] as Roles[];

export function betterAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.method === "POST" && req.path.includes("/sign-up")) {
    const body = req.body;

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

  // Handle email sending errors gracefully
  if (
    error.message &&
    (error.message.includes("Failed to send verification email") ||
      error.message.includes("Failed to send verification OTP"))
  ) {
    console.error("⚠️ Email sending failed, but request will succeed");
    // Don't return error - let the request succeed
    return;
  }

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
