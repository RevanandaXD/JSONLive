-- AlterTable
ALTER TABLE "resource" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "resource" ADD COLUMN "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "resource_token_key" ON "resource"("token");

-- CreateIndex
CREATE UNIQUE INDEX "resource_userId_slug_key" ON "resource"("userId", "slug");