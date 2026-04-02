import { Router } from "express";
import { commentController } from "./comment.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";

const router = Router();

// Create a comment on a post
router.post(
  "/:postId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  commentController.createComment,
);

// Get all comments for a post
router.get(
  "/:postId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  commentController.getCommentsByPostId,
);

// Update a comment
router.put(
  "/:commentId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  commentController.updateComment,
);

// Delete a comment
router.delete(
  "/:commentId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  commentController.deleteComment,
);

export const commentRoutes = router;
