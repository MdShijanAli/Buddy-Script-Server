import { Router } from "express";
import { postController } from "./post.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  postController.createPost,
);
router.get(
  "/",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  postController.getPosts,
);
router.get(
  "/my-posts",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  postController.getMyPosts,
);

export const postRoutes = router;
