import { Request, Response } from "express";
import { likeService } from "./like.service";

const createLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const postId = req.params.postId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
        code: "POST_ID_REQUIRED",
      });
    }
    const like = await likeService.createLike({
      user: { connect: { id: userId } },
      post: { connect: { id: postId } },
    });
    res.json({
      success: true,
      message: "Post liked successfully",
      like,
    });
  } catch (error: any) {
    console.error("Create Like Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to like post",
      code: "CREATE_LIKE_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const unLike = async (req: Request, res: Response) => {
  try {
    const likeId = req.params.likeId;
    if (!likeId) {
      return res.status(400).json({
        success: false,
        message: "Like ID is required",
        code: "LIKE_ID_REQUIRED",
      });
    }
    const result = await likeService.unLike(likeId);
    res.json({
      success: true,
      message: "Like removed successfully",
      like: result,
    });
  } catch (error: any) {
    console.error("Unlike Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove like",
      code: "UNLIKE_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

export const likeController = {
  createLike,
  unLike,
};
