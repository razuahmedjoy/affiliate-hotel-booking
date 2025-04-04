/*
  Warnings:

  - You are about to drop the column `preferredPromotionMethod` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `websiteLink` on the `Affiliate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_affiliateId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_customerId_fkey";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "affiliateId" DROP NOT NULL,
ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Affiliate" DROP COLUMN "preferredPromotionMethod",
DROP COLUMN "websiteLink",
ADD COLUMN     "promotionMethod" TEXT[],
ADD COLUMN     "socialMediaLinks" TEXT;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
