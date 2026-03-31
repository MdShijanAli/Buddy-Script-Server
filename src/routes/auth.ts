import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { auth } from "../lib/auth";
import { toNodeHandler } from "better-auth/node";
import {
  betterAuthErrorHandler,
  betterAuthMiddleware,
} from "../middlewares/betterAuthErrorHandler";

const router = Router();

router.use(betterAuthMiddleware);

// ==================== HANDLE ALL AUTH ROUTES ====================
router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await toNodeHandler(auth)(req, res);
  } catch (error: any) {
    betterAuthErrorHandler(error, req, res, next);
  }
});

export default router;
