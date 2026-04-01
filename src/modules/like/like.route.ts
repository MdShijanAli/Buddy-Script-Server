import { Router } from "express";
import { likeController } from "./like.controller";
import { authMiddleware, UserRole } from "../../middlewares/auth";

const router = Router();

router.post(
  "/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.createLike,
);
router.delete(
  "/:likeId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.unLike,
);
router.get(
  "/post/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  likeController.getLikesByPostId,
);

export const likeRoutes = router;
