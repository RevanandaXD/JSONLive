-- Revert anonymous resources:
-- remove token column, restore NOT NULL on userId, drop unique constraints

-- DropIndex
DROP INDEX "resource_token_key";

-- DropIndex
DROP INDEX "resource_userId_slug_key";

-- DropColumn
ALTER TABLE "resource" DROP COLUMN "token";

-- AlterTable
ALTER TABLE "resource" ALTER COLUMN "userId" SET NOT NULL;