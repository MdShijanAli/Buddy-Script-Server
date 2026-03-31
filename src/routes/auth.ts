import { Router, Response } from "express";
import { auth } from "../lib/auth";
import { toNodeHandler } from "better-auth/node";
import {
  betterAuthErrorHandler,
  betterAuthMiddleware,
} from "../middlewares/betterAuthErrorHandler";

const router = Router();

// Apply middleware to validate signup requests
router.use(betterAuthMiddleware);

// ==================== HANDLE ALL AUTH ROUTES ====================
// This catches all auth routes and delegates to better-auth
router.all("*", async (req, res, next) => {
  try {
    await toNodeHandler(auth)(req, res);
  } catch (error: any) {
    betterAuthErrorHandler(error, req, res, next);
  }
});

export default router;
