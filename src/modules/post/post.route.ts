import { Router } from "express";
import { postController } from "./post.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  postController.createPost,
);

export const postRoutes = router;
