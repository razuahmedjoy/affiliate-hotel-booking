/*
  Warnings:

  - Added the required column `expires_at` to the `ZohoTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ZohoTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ZohoTokens" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_refreshing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
