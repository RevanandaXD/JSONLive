-- AlterTable
ALTER TABLE "user" ADD COLUMN     "maxResource" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
