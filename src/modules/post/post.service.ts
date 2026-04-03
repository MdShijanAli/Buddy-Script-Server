import { PostCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (postPayload: PostCreateInput) => {
  const result = await prisma.post.create({ data: postPayload });
  console.log("Post Created: ", result);
  return result;
};

const getPosts = async () => {
  const posts = await prisma.post.findMany({
    where: {
      visibility: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true,
          profile_image: true,
        },
      },
      likes: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile_image: true,
            },
          },
        },
      },
    },
  });
  return posts;
};

const getMyPosts = async (userId: string) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true,
          profile_image: true,
        },
      },
      likes: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile_image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return posts;
};

const deletePost = async (postId: string, userId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.authorId !== userId) {
    throw new Error("You are not authorized to delete this post");
  }

  const result = await prisma.post.delete({
    where: { id: postId },
  });

  console.log("Post Deleted: ", result);
  return result;
};

export const postService = {
  createPost,
  getPosts,
  getMyPosts,
  deletePost,
};
