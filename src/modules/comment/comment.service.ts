import { prisma } from "../../lib/prisma";

interface CreateCommentInput {
  content: string;
  postId: string;
  authorId: string;
}

interface UpdateCommentInput {
  content: string;
}

const createComment = async (payload: CreateCommentInput) => {
  const result = await prisma.comment.create({
    data: {
      content: payload.content,
      postId: payload.postId,
      authorId: payload.authorId,
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
    },
  });
  console.log("Comment Created: ", result);
  return result;
};

const getCommentsByPostId = async (postId: string) => {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
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
      replies: {
        include: {
          author: {
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
  return comments;
};

const updateComment = async (
  commentId: string,
  userId: string,
  payload: UpdateCommentInput,
) => {
  // Check if comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Check if user is the author
  if (comment.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: payload.content,
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
    },
  });

  console.log("Comment Updated: ", result);
  return result;
};

const deleteComment = async (commentId: string, userId: string) => {
  // Check if comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Check if user is the author
  if (comment.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.comment.delete({
    where: { id: commentId },
  });

  console.log("Comment Deleted: ", result);
  return result;
};

export const commentService = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};
