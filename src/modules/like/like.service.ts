import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

export type LikeTargetType = "post" | "comment" | "reply";

type TxClient = Prisma.TransactionClient;

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 50;

interface PaginationInput {
  page?: number;
  limit?: number;
}

const likerSelect = {
  id: true,
  name: true,
  first_name: true,
  last_name: true,
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

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const findExistingLike = (
  tx: TxClient,
  userId: string,
  targetType: LikeTargetType,
  targetId: string,
) => {
  switch (targetType) {
    case "post":
      return tx.like.findUnique({
        where: { userId_postId: { userId, postId: targetId } },
        select: { id: true },
      });
    case "comment":
      return tx.like.findUnique({
        where: { userId_commentId: { userId, commentId: targetId } },
        select: { id: true },
      });
    case "reply":
      return tx.like.findUnique({
        where: { userId_replyId: { userId, replyId: targetId } },
        select: { id: true },
      });
  }
};

const buildLikeData = (
  userId: string,
  targetType: LikeTargetType,
  targetId: string,
): Prisma.LikeCreateInput => {
  const base = { user: { connect: { id: userId } } };
  switch (targetType) {
    case "post":
      return { ...base, post: { connect: { id: targetId } } };
    case "comment":
      return { ...base, comment: { connect: { id: targetId } } };
    case "reply":
      return { ...base, reply: { connect: { id: targetId } } };
  }
};

const targetExists = async (
  tx: TxClient,
  targetType: LikeTargetType,
  targetId: string,
) => {
  switch (targetType) {
    case "post":
      return Boolean(
        await tx.post.findUnique({
          where: { id: targetId },
          select: { id: true },
        }),
      );
    case "comment":
      return Boolean(
        await tx.comment.findUnique({
          where: { id: targetId },
          select: { id: true },
        }),
      );
    case "reply":
      return Boolean(
        await tx.reply.findUnique({
          where: { id: targetId },
          select: { id: true },
        }),
      );
  }
};

const adjustLikesCount = async (
  tx: TxClient,
  targetType: LikeTargetType,
  targetId: string,
  delta: 1 | -1,
) => {
  const data = { likesCount: { increment: delta } };
  switch (targetType) {
    case "post": {
      const post = await tx.post.update({
        where: { id: targetId },
        data,
        select: { likesCount: true },
      });
      return post.likesCount;
    }
    case "comment": {
      const comment = await tx.comment.update({
        where: { id: targetId },
        data,
        select: { likesCount: true },
      });
      return comment.likesCount;
    }
    case "reply": {
      const reply = await tx.reply.update({
        where: { id: targetId },
        data,
        select: { likesCount: true },
      });
      return reply.likesCount;
    }
  }
};

const getCurrentLikesCount = async (
  tx: TxClient,
  targetType: LikeTargetType,
  targetId: string,
) => {
  switch (targetType) {
    case "post": {
      const post = await tx.post.findUniqueOrThrow({
        where: { id: targetId },
        select: { likesCount: true },
      });
      return post.likesCount;
    }
    case "comment": {
      const comment = await tx.comment.findUniqueOrThrow({
        where: { id: targetId },
        select: { likesCount: true },
      });
      return comment.likesCount;
    }
    case "reply": {
      const reply = await tx.reply.findUniqueOrThrow({
        where: { id: targetId },
        select: { likesCount: true },
      });
      return reply.likesCount;
    }
  }
};

const targetWhere = (targetType: LikeTargetType, targetId: string) => {
  switch (targetType) {
    case "post":
      return { postId: targetId };
    case "comment":
      return { commentId: targetId };
    case "reply":
      return { replyId: targetId };
  }
};

/**
 * Toggles a like for the given target: creates it if missing, removes it if
 * present. Runs inside a transaction so the like row and the denormalized
 * counter never drift apart, and falls back gracefully if a concurrent
 * request already created/removed the same like (unique constraint race).
 */
const toggleLike = async (
  userId: string,
  targetType: LikeTargetType,
  targetId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await findExistingLike(tx, userId, targetType, targetId);

    if (existing) {
      await tx.like.delete({ where: { id: existing.id } });
      const likesCount = await adjustLikesCount(tx, targetType, targetId, -1);
      return { liked: false, likesCount };
    }

    const exists = await targetExists(tx, targetType, targetId);
    if (!exists) {
      throw new Error(`${targetType} not found`);
    }

    try {
      await tx.like.create({
        data: buildLikeData(userId, targetType, targetId),
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const likesCount = await getCurrentLikesCount(
          tx,
          targetType,
          targetId,
        );
        return { liked: true, likesCount };
      }
      throw error;
    }

    const likesCount = await adjustLikesCount(tx, targetType, targetId, 1);
    return { liked: true, likesCount };
  });
};

const getLikesByTarget = async (
  targetType: LikeTargetType,
  targetId: string,
  pagination: PaginationInput,
) => {
  const { skip, take, page, limit } = normalizePagination(pagination);
  const where = targetWhere(targetType, targetId);

  const [likes, total] = await prisma.$transaction([
    prisma.like.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        user: { select: likerSelect },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.like.count({ where }),
  ]);

  return {
    likes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const likeService = {
  toggleLike,
  getLikesByTarget,
};
