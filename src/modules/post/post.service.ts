import {
  PostCreateInput,
  PostUpdateInput,
} from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 50;
const LIKE_PREVIEW_SIZE = 5;

interface PaginationInput {
  page?: number;
  limit?: number;
}

const authorSelect = {
  id: true,
  email: true,
  name: true,
  profile_image: true,
} as const;

// Only a small, recent slice of likers is needed for the avatar preview —
// the authoritative count lives on Post.likesCount already.
const likePreviewInclude = {
  select: {
    id: true,
    user: { select: authorSelect },
  },
  orderBy: { createdAt: "desc" as const },
  take: LIKE_PREVIEW_SIZE,
};

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

// One indexed IN-query for the whole page instead of asking the caller to
// search the (bounded) like preview client-side for their own like.
const attachLikedFlag = async <T extends { id: string }>(
  posts: T[],
  userId: string,
): Promise<Array<T & { liked: boolean }>> => {
  if (posts.length === 0) return [];

  const myLikes = await prisma.like.findMany({
    where: { userId, postId: { in: posts.map((post) => post.id) } },
    select: { postId: true },
  });
  const likedPostIds = new Set(myLikes.map((like) => like.postId));

  return posts.map((post) => ({
    ...post,
    liked: likedPostIds.has(post.id),
  }));
};

const createPost = async (postPayload: PostCreateInput) => {
  return prisma.post.create({ data: postPayload });
};

const updatePost = async (
  postId: string,
  postPayload: PostUpdateInput,
  userId: string,
) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.authorId !== userId) {
    throw new Error("You are not authorized to update this post");
  }

  return prisma.post.update({
    where: { id: postId },
    data: postPayload,
  });
};

const getPosts = async (userId: string, pagination: PaginationInput) => {
  const { skip, take, page, limit } = normalizePagination(pagination);
  const where = { visibility: "PUBLIC" as const };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: authorSelect },
        likes: likePreviewInclude,
      },
      skip,
      take,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: await attachLikedFlag(posts, userId),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

const getMyPosts = async (userId: string, pagination: PaginationInput) => {
  const { skip, take, page, limit } = normalizePagination(pagination);
  const where = { authorId: userId };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: {
        author: { select: authorSelect },
        likes: likePreviewInclude,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: await attachLikedFlag(posts, userId),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
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

  return prisma.post.delete({
    where: { id: postId },
  });
};

export const postService = {
  createPost,
  getPosts,
  getMyPosts,
  deletePost,
  updatePost,
};
