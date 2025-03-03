/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `InitialAffiliatePayment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `transactionId` on table `InitialAffiliatePayment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InitialAffiliatePayment" ALTER COLUMN "transactionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InitialAffiliatePayment_transactionId_key" ON "InitialAffiliatePayment"("transactionId");
