import { Router } from "express";
import { likeController } from "./like.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";

const router = Router();

// Post likes
router.post(
  "/post/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.createPostLike,
);
router.get(
  "/post/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.getLikesByPostId,
);

// Comment likes
router.post(
  "/comment/:commentId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.createCommentLike,
);
router.get(
  "/comment/:commentId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.getLikesByCommentId,
);

// Reply likes
router.post(
  "/reply/:replyId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.createReplyLike,
);
router.get(
  "/reply/:replyId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.getLikesByReplyId,
);

// Unlike (works for all types)
router.delete(
  "/:likeId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.unLike,
);

export const likeRoutes = router;
