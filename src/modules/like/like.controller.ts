import { Request, Response } from "express";
import { likeService, LikeTargetType } from "./like.service";

const getSingleValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const TARGET_LABEL: Record<LikeTargetType, string> = {
  post: "Post",
  comment: "Comment",
  reply: "Reply",
};

const toggleLikeHandler =
  (targetType: LikeTargetType, paramName: string) =>
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const targetId = getSingleValue(
        (req.params as Record<string, string | string[] | undefined>)[
          paramName
        ],
      );
      const label = TARGET_LABEL[targetType];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }
      if (!targetId) {
        return res.status(400).json({
          success: false,
          message: `${label} ID is required`,
          code: `${targetType.toUpperCase()}_ID_REQUIRED`,
        });
      }

      const result = await likeService.toggleLike(
        userId,
        targetType,
        targetId,
      );

      res.json({
        success: true,
        message: `${label} ${result.liked ? "liked" : "unliked"} successfully`,
        liked: result.liked,
        likesCount: result.likesCount,
      });
    } catch (error: any) {
      console.error(`Toggle ${targetType} Like Error: `, error);
      if (error.message === `${targetType} not found`) {
        return res.status(404).json({
          success: false,
          message: `${TARGET_LABEL[targetType]} not found`,
          code: `${targetType.toUpperCase()}_NOT_FOUND`,
        });
      }
      res.status(500).json({
        success: false,
        message: `Failed to toggle like on ${targetType}`,
        code: "TOGGLE_LIKE_ERROR",
        error: {
          message:
            error.message?.split("\n").pop().trim() || error.message || error,
        },
      });
    }
  };

const getLikesHandler =
  (targetType: LikeTargetType, paramName: string) =>
  async (req: Request, res: Response) => {
    try {
      const targetId = getSingleValue(
        (req.params as Record<string, string | string[] | undefined>)[
          paramName
        ],
      );
      const label = TARGET_LABEL[targetType];

      if (!targetId) {
        return res.status(400).json({
          success: false,
          message: `${label} ID is required`,
          code: `${targetType.toUpperCase()}_ID_REQUIRED`,
        });
      }

      const page = Number(req.query.page);
      const limit = Number(req.query.limit);

      const result = await likeService.getLikesByTarget(
        targetType,
        targetId,
        {
          page: Number.isFinite(page) ? page : undefined,
          limit: Number.isFinite(limit) ? limit : undefined,
        },
      );

      res.json({
        success: true,
        message: "Likes retrieved successfully",
        likes: result.likes,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error(`Get ${targetType} Likes Error: `, error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve likes",
        code: "GET_LIKES_ERROR",
        error: {
          message:
            error.message?.split("\n").pop().trim() || error.message || error,
        },
      });
    }
  };

export const likeController = {
  togglePostLike: toggleLikeHandler("post", "postId"),
  toggleCommentLike: toggleLikeHandler("comment", "commentId"),
  toggleReplyLike: toggleLikeHandler("reply", "replyId"),
  getPostLikes: getLikesHandler("post", "postId"),
  getCommentLikes: getLikesHandler("comment", "commentId"),
  getReplyLikes: getLikesHandler("reply", "replyId"),
};
