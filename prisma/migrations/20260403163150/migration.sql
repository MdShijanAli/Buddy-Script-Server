/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,commentId]` on the table `like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,replyId]` on the table `like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "like_userId_postId_commentId_replyId_key";

-- AlterTable
ALTER TABLE "reply" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_post_like" ON "like"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_comment_like" ON "like"("userId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_reply_like" ON "like"("userId", "replyId");
