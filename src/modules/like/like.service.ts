import { LikeCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createLike = async (payload: LikeCreateInput) => {
  const userId = payload.user.connect.id;
  const postId = payload.post?.connect?.id;
  const commentId = payload.comment?.connect?.id;
  const replyId = payload.reply?.connect?.id;

  const whereClause: any = { userId };
  if (postId) whereClause.postId = postId;
  else if (commentId) whereClause.commentId = commentId;
  else if (replyId) whereClause.replyId = replyId;

  const existingLike = await prisma.like.findFirst({ where: whereClause });
  if (existingLike) {
    throw new Error("You have already liked this post");
  }

  const result = await prisma.like.create({ data: payload });

  if (postId) {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
      select: {
        id: true,
        content: true,
        visibility: true,
        likesCount: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: result.id,
      createdAt: result.createdAt,
      post: updatedPost,
    };
  }

  return {
    id: result.id,
    createdAt: result.createdAt,
  };
};

const unLike = async (likeId: string) => {
  const like = await prisma.like.findUnique({ where: { id: likeId } });
  if (!like) {
    throw new Error("Like not found");
  }

  await prisma.like.delete({ where: { id: likeId } });

  // Update likes count for the associated post
  if (like.postId) {
    const updatedPost = await prisma.post.update({
      where: { id: like.postId },
      data: { likesCount: { decrement: 1 } },
      select: {
        id: true,
        content: true,
        visibility: true,
        likesCount: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: like.id,
      createdAt: like.createdAt,
      post: updatedPost,
    };
  }
};

export const likeService = {
  createLike,
  unLike,
};
