import { Router } from "express";
import { likeController } from "./like.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";

const router = Router();

// Post likes (POST toggles like/unlike)
router.post(
  "/post/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.togglePostLike,
);
router.get(
  "/post/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.getPostLikes,
);

// Comment likes (POST toggles like/unlike)
router.post(
  "/comment/:commentId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.toggleCommentLike,
);
router.get(
  "/comment/:commentId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.getCommentLikes,
);

// Reply likes (POST toggles like/unlike)
router.post(
  "/reply/:replyId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.toggleReplyLike,
);
router.get(
  "/reply/:replyId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.getReplyLikes,
);

export const likeRoutes = router;
