import { Request, Response } from "express";
import { postService } from "./post.service";
import { envVars } from "../../config/env";

const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
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

    const result = await postService.createPost({
      title: req.body.title,
      content: req.body.content,
      visibility: req.body.visibility,
      imageUrl,
      author: { connect: { id: userId } },
    });
    res.json({
      success: true,
      message: "Post created successfully",
      post: result,
    });
  } catch (error: any) {
    console.error("Create Post Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      code: "CREATE_POST_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const getPosts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    const posts = await postService.getPosts();
    res.json({
      success: true,
      message: "Posts retrieved successfully",
      posts,
    });
  } catch (error: any) {
    console.error("Get Posts Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve posts",
      code: "GET_POSTS_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const getMyPosts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    const posts = await postService.getMyPosts(userId);
    res.json({
      success: true,
      message: "My posts retrieved successfully",
      posts,
    });
  } catch (error: any) {
    console.error("Get My Posts Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve my posts",
      code: "GET_MY_POSTS_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

export const postController = {
  createPost,
  getPosts,
  getMyPosts,
};
