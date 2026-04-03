import { Router } from "express";
import { replyController } from "./reply.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";
import { uploadPostImage } from "../../middlewares/upload";

const router = Router();

// Create a reply on a comment
router.post(
  "/:commentId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  uploadPostImage.fields([
    { name: "image", maxCount: 1 },
    { name: "imageUrl", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  replyController.createReply,
);

// Get all replies for a comment
router.get(
  "/:commentId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  replyController.getRepliesByCommentId,
);

// Update a reply
router.put(
  "/:replyId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  replyController.updateReply,
);

// Delete a reply
router.delete(
  "/:replyId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  replyController.deleteReply,
);

export const replyRoutes = router;
