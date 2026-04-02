import { Request, Response } from "express";
import { likeService } from "./like.service";

const createPostLike = async (req: Request, res: Response) => {
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
    const like = await likeService.createPostLike({
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
    if (error.message?.includes("already liked")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: "ALREADY_LIKED",
      });
    }
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

const createCommentLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const commentId = req.params.commentId;
    const { postId } = req.query;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
        code: "COMMENT_ID_REQUIRED",
      });
    }
    const like = await likeService.createCommentLike({
      user: { connect: { id: userId } },
      comment: { connect: { id: commentId } },
      post: postId ? { connect: { id: String(postId) } } : undefined,
    });
    res.json({
      success: true,
      message: "Comment liked successfully",
      like,
    });
  } catch (error: any) {
    console.error("Create Comment Like Error: ", error);
    if (error.message?.includes("already liked")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: "ALREADY_LIKED",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to like comment",
      code: "CREATE_COMMENT_LIKE_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const createReplyLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const replyId = req.params.replyId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    if (!replyId) {
      return res.status(400).json({
        success: false,
        message: "Reply ID is required",
        code: "REPLY_ID_REQUIRED",
      });
    }
    const like = await likeService.createReplyLike({
      user: { connect: { id: userId } },
      reply: { connect: { id: replyId } },
    });
    res.json({
      success: true,
      message: "Reply liked successfully",
      like,
    });
  } catch (error: any) {
    console.error("Create Reply Like Error: ", error);
    if (error.message?.includes("already liked")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: "ALREADY_LIKED",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to like reply",
      code: "CREATE_REPLY_LIKE_ERROR",
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
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
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
    if (error.message === "Like not found") {
      return res.status(404).json({
        success: false,
        message: "Like not found",
        code: "LIKE_NOT_FOUND",
      });
    }
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

const getLikesByPostId = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const userId = (req as any).user?.userId;
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
    const likes = await likeService.getLikesByPostId(postId);
    res.json({
      success: true,
      message: "Likes retrieved successfully",
      likes,
    });
  } catch (error: any) {
    console.error("Get Likes Error: ", error);
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

const getLikesByCommentId = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
        code: "COMMENT_ID_REQUIRED",
      });
    }
    const likes = await likeService.getLikesByCommentId(commentId);
    res.json({
      success: true,
      message: "Likes retrieved successfully",
      likes,
    });
  } catch (error: any) {
    console.error("Get Comment Likes Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve likes",
      code: "GET_COMMENT_LIKES_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const getLikesByReplyId = async (req: Request, res: Response) => {
  try {
    const replyId = req.params.replyId;
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    if (!replyId) {
      return res.status(400).json({
        success: false,
        message: "Reply ID is required",
        code: "REPLY_ID_REQUIRED",
      });
    }
    const likes = await likeService.getLikesByReplyId(replyId);
    res.json({
      success: true,
      message: "Likes retrieved successfully",
      likes,
    });
  } catch (error: any) {
    console.error("Get Reply Likes Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve likes",
      code: "GET_REPLY_LIKES_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

export const likeController = {
  createPostLike,
  createCommentLike,
  createReplyLike,
  unLike,
  getLikesByPostId,
  getLikesByCommentId,
  getLikesByReplyId,
};
