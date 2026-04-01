import { PostCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (postPayload: PostCreateInput) => {
  const result = await prisma.post.create({ data: postPayload });
  console.log("Post Created: ", result);
  return result;
};

export const postService = {
  createPost,
};
