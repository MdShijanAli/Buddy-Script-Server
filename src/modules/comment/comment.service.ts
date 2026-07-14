import { prisma } from "../../lib/prisma";

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 100;

interface PaginationInput {
  page?: number;
  limit?: number;
}

interface CreateCommentInput {
  content: string;
  postId: string;
  authorId: string;
  imageUrl?: string;
}

interface UpdateCommentInput {
  content?: string;
  imageUrl?: string;
}

const authorSelect = {
  id: true,
  email: true,
  name: true,
  profile_image: true,
} as const;

const normalizePagination = ({ page, limit }: PaginationInput) => {
  const safePage = Number.isInteger(page) && page! > 0 ? page! : 1;
  const safeLimit =
    Number.isInteger(limit) && limit! > 0
      ? Math.min(limit!, PAGE_SIZE_MAX)
      : PAGE_SIZE_DEFAULT;
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit,
  };
};

const createComment = async (payload: CreateCommentInput) => {
  const result = await prisma.comment.create({
    data: {
      content: payload.content,
      postId: payload.postId,
      authorId: payload.authorId,
      imageUrl: payload.imageUrl,
    },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  // Only the updated counter is needed by callers — no reason to pull the
  // post's author/content back down just to increment commentsCount.
  const updatedPost = await prisma.post.update({
    where: { id: payload.postId },
    data: { commentsCount: { increment: 1 } },
    select: {
      id: true,
      commentsCount: true,
    },
  });

  return {
    id: result.id,
    createdAt: result.createdAt,
    post: { ...result, ...updatedPost },
  };
};

const getCommentsByPostId = async (
  postId: string,
  pagination: PaginationInput,
) => {
  const { skip, take, page, limit } = normalizePagination(pagination);
  const where = { postId };

  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      include: {
        author: { select: authorSelect },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
        replies: {
          include: {
            author: { select: authorSelect },
            likes: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
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

  if (!payload.content && !payload.imageUrl) {
    throw new Error("At least one field is required to update");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: {
      content: payload.content,
      imageUrl: payload.imageUrl,
    },
    include: {
      author: { select: authorSelect },
    },
  });
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

  return prisma.$transaction(async (transaction) => {
    const replyCount = await transaction.reply.count({
      where: { commentId },
    });

    const deletedComment = await transaction.comment.delete({
      where: { id: commentId },
    });

    await transaction.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 + replyCount } },
    });

    return deletedComment;
  });
};

export const commentService = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};
