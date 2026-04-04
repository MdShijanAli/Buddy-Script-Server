import { Router } from "express";
import { commentController } from "./comment.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";
import { uploadPostImage } from "../../middlewares/upload";

const router = Router();

// Create a comment on a post
router.post(
  "/:postId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  uploadPostImage.fields([
    { name: "image", maxCount: 1 },
    { name: "imageUrl", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
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
  uploadPostImage.fields([
    { name: "image", maxCount: 1 },
    { name: "imageUrl", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  commentController.updateComment,
);

// Delete a comment
router.delete(
  "/:commentId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  commentController.deleteComment,
);

export const commentRoutes = router;
