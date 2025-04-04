/*
  Warnings:

  - You are about to drop the column `addressId` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccount` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountNo` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `addressId` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Affiliate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `affiliateId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Affiliate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'AFFILIATE', 'CUSTOMER');

-- DropForeignKey
ALTER TABLE "Affiliate" DROP CONSTRAINT "Affiliate_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_addressId_fkey";

-- DropIndex
DROP INDEX "Affiliate_addressId_key";

-- DropIndex
DROP INDEX "Affiliate_email_key";

-- DropIndex
DROP INDEX "Customer_addressId_key";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "affiliateId" TEXT NOT NULL,
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Affiliate" DROP COLUMN "addressId",
DROP COLUMN "bankAccount",
DROP COLUMN "bankAccountNo",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "role",
ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "affiliateType" TEXT,
ADD COLUMN     "bankAccountType" TEXT,
ADD COLUMN     "bankAddress" TEXT,
ADD COLUMN     "bankIfscCode" TEXT,
ADD COLUMN     "bankMicrCode" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "preferredPromotionMethod" TEXT[] DEFAULT ARRAY['EMAIL', 'WHATSAPP', 'SMS']::TEXT[],
ADD COLUMN     "upiId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "websiteLink" TEXT;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "addressId";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" VARCHAR(20),
    "whatsappNumber" VARCHAR(20),
    "dateOfBirth" DATE,
    "gender" VARCHAR(10),
    "password" VARCHAR(255) NOT NULL,
    "role" TEXT[] DEFAULT ARRAY['USER']::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_whatsappNumber_key" ON "User"("whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_userId_key" ON "Affiliate"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
