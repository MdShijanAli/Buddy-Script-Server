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

export const likeRoutes = router;
