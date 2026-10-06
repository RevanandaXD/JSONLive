-- Sync drift (column exists in DB but missing from migration history)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleteRequestedAt" TIMESTAMP(3);
-- Align role default with schema.prisma (no DB default)
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "disabled" BOOLEAN NOT NULL DEFAULT false;