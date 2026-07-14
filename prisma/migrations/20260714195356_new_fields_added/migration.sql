-- DropIndex
DROP INDEX "comment_postId_idx";

-- DropIndex
DROP INDEX "like_commentId_idx";

-- DropIndex
DROP INDEX "like_postId_idx";

-- DropIndex
DROP INDEX "like_replyId_idx";

-- DropIndex
DROP INDEX "like_userId_idx";

-- DropIndex
DROP INDEX "post_authorId_idx";

-- DropIndex
DROP INDEX "post_createdAt_idx";

-- DropIndex
DROP INDEX "post_visibility_idx";

-- CreateIndex
CREATE INDEX "comment_postId_createdAt_idx" ON "comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "like_postId_createdAt_idx" ON "like"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "like_commentId_createdAt_idx" ON "like"("commentId", "createdAt");

-- CreateIndex
CREATE INDEX "like_replyId_createdAt_idx" ON "like"("replyId", "createdAt");

-- CreateIndex
CREATE INDEX "post_authorId_createdAt_idx" ON "post"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "post_visibility_createdAt_idx" ON "post"("visibility", "createdAt");
