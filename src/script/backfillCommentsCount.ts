import { prisma } from "../lib/prisma";

const getTotalDiscussionCount = (
  comments: Array<{ replies: Array<{ id: string }> }>,
) => {
  return comments.reduce(
    (total, comment) => total + 1 + comment.replies.length,
    0,
  );
};

async function main() {
  await prisma.$connect();

  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        comments: {
          select: {
            id: true,
            replies: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    let updatedCount = 0;

    for (const post of posts) {
      const totalCommentsCount = getTotalDiscussionCount(post.comments);

      await prisma.post.update({
        where: { id: post.id },
        data: { commentsCount: totalCommentsCount },
      });

      updatedCount += 1;
    }

    console.log(`Backfilled commentsCount for ${updatedCount} posts.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
