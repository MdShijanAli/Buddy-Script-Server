import { PostCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (postPayload: PostCreateInput) => {
  const result = await prisma.post.create({ data: postPayload });
  console.log("Post Created: ", result);
  return result;
};

const getPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
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
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return posts;
};

export const postService = {
  createPost,
  getPosts,
  getMyPosts,
};
