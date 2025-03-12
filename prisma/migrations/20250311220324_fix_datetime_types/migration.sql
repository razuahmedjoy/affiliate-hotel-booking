-- AlterTable
ALTER TABLE "ZohoTokens" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(6);

-- CreateIndex
CREATE INDEX "expires_at_index" ON "ZohoTokens"("expires_at");
