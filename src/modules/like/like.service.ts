import { LikeCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPostLike = async (payload: LikeCreateInput) => {
  const userId = payload.user.connect.id;
  const postId = payload.post?.connect?.id;

  const existingLike = await prisma.like.findFirst({
    where: { userId, postId },
  });
  if (existingLike) {
    throw new Error("You have already liked this post");
  }

  const result = await prisma.like.create({ data: payload });

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
};

const createCommentLike = async (payload: LikeCreateInput) => {
  const userId = payload.user.connect.id;
  const commentId = payload.comment?.connect?.id;

  const existingLike = await prisma.like.findFirst({
    where: { userId, commentId },
  });
  if (existingLike) {
    throw new Error("You have already liked this comment");
  }

  const result = await prisma.like.create({ data: payload });

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { likesCount: { increment: 1 } },
    select: {
      id: true,
      content: true,
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
    comment: updatedComment,
  };
};

const createReplyLike = async (payload: LikeCreateInput) => {
  const userId = payload.user.connect.id;
  const replyId = payload.reply?.connect?.id;

  const existingLike = await prisma.like.findFirst({
    where: { userId, replyId },
  });
  if (existingLike) {
    throw new Error("You have already liked this reply");
  }

  const result = await prisma.like.create({ data: payload });

  const updatedReply = await prisma.reply.update({
    where: { id: replyId },
    data: { likesCount: { increment: 1 } },
    select: {
      id: true,
      content: true,
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
    reply: updatedReply,
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

  // Update likes count for the associated comment
  if (like.commentId) {
    const updatedComment = await prisma.comment.update({
      where: { id: like.commentId },
      data: { likesCount: { decrement: 1 } },
      select: {
        id: true,
        content: true,
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
      comment: updatedComment,
    };
  }

  // Update likes count for the associated reply
  if (like.replyId) {
    const updatedReply = await prisma.reply.update({
      where: { id: like.replyId },
      data: { likesCount: { decrement: 1 } },
      select: {
        id: true,
        content: true,
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
      reply: updatedReply,
    };
  }
};

const getLikesByPostId = async (postId: string) => {
  const likes = await prisma.like.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          first_name: true,
          last_name: true,
          profile_image: true,
        },
      },
    },
  });

  return likes;
};

const getLikesByCommentId = async (commentId: string) => {
  const likes = await prisma.like.findMany({
    where: { commentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          first_name: true,
          last_name: true,
          profile_image: true,
        },
      },
    },
  });

  return likes;
};

const getLikesByReplyId = async (replyId: string) => {
  const likes = await prisma.like.findMany({
    where: { replyId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          first_name: true,
          last_name: true,
          profile_image: true,
        },
      },
    },
  });

  return likes;
};

export const likeService = {
  createPostLike,
  createCommentLike,
  createReplyLike,
  unLike,
  getLikesByPostId,
  getLikesByCommentId,
  getLikesByReplyId,
};
