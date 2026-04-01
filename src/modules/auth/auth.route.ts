import { Router } from "express";
import { betterAuthMiddleware } from "../../middlewares/betterAuthErrorHandler";
import { authController } from "./auth.controller";

const router = Router();

router.use(betterAuthMiddleware);

router.post("/sign-in", authController.login);
router.post("/sign-up", authController.register);

export const authRoutes = router;
