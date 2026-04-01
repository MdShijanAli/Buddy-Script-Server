import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { authMiddleware } from "../../middlewares/auth";
import { getUserById, updateUserProfile } from "../../utils/authHelpers";
import { prisma } from "../../lib/prisma";

const router = Router();

// ==================== GET CURRENT USER PROFILE ====================
router.get(
  "/me",
  authMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await getUserById(userId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// ==================== GET USER BY ID ====================
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await getUserById(id);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
});

// ==================== UPDATE USER PROFILE ====================
router.put(
  "/me/profile",
  authMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { firstName, lastName, bio, location, profileImage, phone } =
        req.body;

      const result = await updateUserProfile(userId, {
        firstName,
        lastName,
        bio,
        location,
        profileImage,
        phone,
      });

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// ==================== SEARCH USERS ====================
router.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit = 10, offset = 0 } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { first_name: { contains: q, mode: "insensitive" } },
            { last_name: { contains: q, mode: "insensitive" } },
          ],
          is_banned: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          first_name: true,
          last_name: true,
          profile_image: true,
          bio: true,
          role: true,
          createdAt: true,
        },
        take: Math.min(parseInt(limit as string) || 10, 50),
        skip: Math.max(0, parseInt(offset as string) || 0),
      });

      return res.status(200).json({
        success: true,
        data: users,
        count: users.length,
        message: "Users found",
      });
    } catch (error) {
      next(error);
    }
  },
);

// ==================== GET USER POSTS ====================
router.get(
  "/:id/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const posts = await prisma.post.findMany({
        where: {
          authorId: id,
          isPublished: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profile_image: true,
              role: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          comments: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(parseInt(limit as string) || 20, 100),
        skip: Math.max(0, parseInt(offset as string) || 0),
      });

      return res.status(200).json({
        success: true,
        data: posts.map((post) => ({
          ...post,
          likesCount: post.likes.length,
          commentsCount: post.comments.length,
        })),
        message: "Posts retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

export const userRoutes = router;
