import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/sign-in", authController.login);
router.post("/sign-up", authController.register);
router.post("/sign-out", authController.logout);

export const authRoutes = router;
