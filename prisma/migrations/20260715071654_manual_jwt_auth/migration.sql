-- Add password column (nullable first so we can backfill existing rows)
ALTER TABLE "user" ADD COLUMN "password" TEXT;

-- Backfill from existing better-auth credential accounts
UPDATE "user" u
SET "password" = a."password"
FROM "account" a
WHERE a."userId" = u."id" AND a."password" IS NOT NULL;

-- Enforce NOT NULL now that all rows are backfilled
ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL;

-- Drop now-unused better-auth columns and tables
ALTER TABLE "user" DROP COLUMN "emailVerified";
ALTER TABLE "user" DROP COLUMN "image";

DROP TABLE "account";
DROP TABLE "session";
DROP TABLE "verification";
