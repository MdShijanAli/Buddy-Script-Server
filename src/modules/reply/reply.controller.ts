import { Request, Response } from "express";
import { replyService } from "./reply.service";
import { envVars } from "../../config/env";

const getSingleValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const createReply = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const commentId = getSingleValue(req.params.commentId);

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

    const result = await replyService.createReply({
      content: req.body.content,
      commentId,
      authorId: userId,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      reply: result,
    });
  } catch (error: any) {
    console.error("Create Reply Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to create reply",
      code: "CREATE_REPLY_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const getRepliesByCommentId = async (req: Request, res: Response) => {
  try {
    const commentId = getSingleValue(req.params.commentId);

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
        code: "COMMENT_ID_REQUIRED",
      });
    }

    const replies = await replyService.getRepliesByCommentId(commentId);

    res.json({
      success: true,
      message: "Replies retrieved successfully",
      replies,
    });
  } catch (error: any) {
    console.error("Get Replies Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve replies",
      code: "GET_REPLIES_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const updateReply = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const replyId = getSingleValue(req.params.replyId);

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

    const result = await replyService.updateReply(replyId, userId, {
      content: req.body.content,
    });

    res.json({
      success: true,
      message: "Reply updated successfully",
      reply: result,
    });
  } catch (error: any) {
    console.error("Update Reply Error: ", error);
    if (error.message === "Reply not found") {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
        code: "REPLY_NOT_FOUND",
      });
    }
    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You can only update your own replies",
        code: "UNAUTHORIZED",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update reply",
      code: "UPDATE_REPLY_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const deleteReply = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const replyId = getSingleValue(req.params.replyId);

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

    await replyService.deleteReply(replyId, userId);

    res.json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Reply Error: ", error);
    if (error.message === "Reply not found") {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
        code: "REPLY_NOT_FOUND",
      });
    }
    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own replies",
        code: "UNAUTHORIZED",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete reply",
      code: "DELETE_REPLY_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

export const replyController = {
  createReply,
  getRepliesByCommentId,
  updateReply,
  deleteReply,
};
