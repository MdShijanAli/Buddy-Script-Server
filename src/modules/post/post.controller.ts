import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    console.log("Request User----->", req.user);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const result = await postService.createPost({
      ...req.body,
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
