import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { envVars } from "../../config/env";

const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { postId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!postId || Array.isArray(postId)) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
        code: "POST_ID_REQUIRED",
      });
    }

    const uploadedFiles = (
      req as Request & {
        files?: { [fieldname: string]: Express.Multer.File[] };
      }
    ).files;
    const uploadedFile =
      uploadedFiles?.image?.[0] ||
      uploadedFiles?.imageUrl?.[0] ||
      uploadedFiles?.file?.[0];
    const imageUrl = uploadedFile
      ? `${envVars.BETTER_AUTH_URL}/uploads/posts/${uploadedFile.filename}`
      : undefined;

    if (!req.body.content && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Comment content or image is required",
        code: "CONTENT_OR_IMAGE_REQUIRED",
      });
    }

    const result = await commentService.createComment({
      content: req.body.content,
      postId,
      authorId: userId,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: result,
    });
  } catch (error: any) {
    console.error("Create Comment Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to create comment",
      code: "CREATE_COMMENT_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const getCommentsByPostId = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId || Array.isArray(postId)) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
        code: "POST_ID_REQUIRED",
      });
    }

    const comments = await commentService.getCommentsByPostId(postId);

    res.json({
      success: true,
      message: "Comments retrieved successfully",
      comments,
    });
  } catch (error: any) {
    console.error("Get Comments Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve comments",
      code: "GET_COMMENTS_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { commentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!commentId || Array.isArray(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
        code: "COMMENT_ID_REQUIRED",
      });
    }

    const uploadedFiles = (
      req as Request & {
        files?: { [fieldname: string]: Express.Multer.File[] };
      }
    ).files;
    const uploadedFile =
      uploadedFiles?.image?.[0] ||
      uploadedFiles?.imageUrl?.[0] ||
      uploadedFiles?.file?.[0];
    const imageUrl = uploadedFile
      ? `${envVars.BETTER_AUTH_URL}/uploads/posts/${uploadedFile.filename}`
      : undefined;

    if (!req.body.content && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "At least content or image is required to update",
        code: "UPDATE_FIELD_REQUIRED",
      });
    }

    const result = await commentService.updateComment(commentId, userId, {
      content: req.body.content,
      imageUrl,
    });

    res.json({
      success: true,
      message: "Comment updated successfully",
      comment: result,
    });
  } catch (error: any) {
    console.error("Update Comment Error: ", error);
    if (error.message === "Comment not found") {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
        code: "COMMENT_NOT_FOUND",
      });
    }
    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You can only update your own comments",
        code: "UNAUTHORIZED",
      });
    }
    if (error.message === "At least one field is required to update") {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
        code: "UPDATE_FIELD_REQUIRED",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      code: "UPDATE_COMMENT_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { commentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!commentId || Array.isArray(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
        code: "COMMENT_ID_REQUIRED",
      });
    }

    await commentService.deleteComment(commentId, userId);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Comment Error: ", error);
    if (error.message === "Comment not found") {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
        code: "COMMENT_NOT_FOUND",
      });
    }
    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
        code: "UNAUTHORIZED",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      code: "DELETE_COMMENT_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

export const commentController = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};
