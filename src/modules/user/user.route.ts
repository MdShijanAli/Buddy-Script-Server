import { Router } from "express";
import { userController } from "./user.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";
import { uploadProfileImage } from "../../middlewares/upload";

const router = Router();

router.get(
  "/profile",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  userController.getMyProfile,
);

router.put(
  "/profile",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  uploadProfileImage.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  userController.updateMyProfile,
);

export const userRoutes = router;
