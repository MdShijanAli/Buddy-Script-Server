import { Router } from "express";
import { postController } from "./post.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";
import { uploadPostImage } from "../../middlewares/upload";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  uploadPostImage.fields([
    { name: "image", maxCount: 1 },
    { name: "imageUrl", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  postController.createPost,
);

router.put(
  "/:postId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  uploadPostImage.fields([
    { name: "image", maxCount: 1 },
    { name: "imageUrl", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  postController.updatePost,
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
router.delete(
  "/:postId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  postController.deletePost,
);

export const postRoutes = router;
