import { Router } from "express";
import { betterAuthMiddleware } from "../../middlewares/betterAuthErrorHandler";
import { authController } from "./auth.controller";

const router = Router();

router.use(betterAuthMiddleware);

router.post("/sign-in", authController.login);
router.post("/sign-up", authController.register);
router.post("/sign-out", authController.logout);

export const authRoutes = router;
