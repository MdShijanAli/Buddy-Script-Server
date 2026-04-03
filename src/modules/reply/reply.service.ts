import { prisma } from "../../lib/prisma";

interface CreateReplyInput {
  content: string;
  commentId: string;
  authorId: string;
  imageUrl?: string;
}

interface UpdateReplyInput {
  content: string;
}

const createReply = async (payload: CreateReplyInput) => {
  const result = await prisma.reply.create({
    data: {
      content: payload.content,
      commentId: payload.commentId,
      authorId: payload.authorId,
      imageUrl: payload.imageUrl,
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
  });
  console.log("Reply Created: ", result);
  return result;
};

const getRepliesByCommentId = async (commentId: string) => {
  const replies = await prisma.reply.findMany({
    where: {
      commentId,
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
  return replies;
};

const updateReply = async (
  replyId: string,
  userId: string,
  payload: UpdateReplyInput,
) => {
  // Check if reply exists
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
  });

  if (!reply) {
    throw new Error("Reply not found");
  }

  // Check if user is the author
  if (reply.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.reply.update({
    where: { id: replyId },
    data: {
      content: payload.content,
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
  });

  console.log("Reply Updated: ", result);
  return result;
};

const deleteReply = async (replyId: string, userId: string) => {
  // Check if reply exists
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
  });

  if (!reply) {
    throw new Error("Reply not found");
  }

  // Check if user is the author
  if (reply.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.reply.delete({
    where: { id: replyId },
  });

  console.log("Reply Deleted: ", result);
  return result;
};

export const replyService = {
  createReply,
  getRepliesByCommentId,
  updateReply,
  deleteReply,
};
