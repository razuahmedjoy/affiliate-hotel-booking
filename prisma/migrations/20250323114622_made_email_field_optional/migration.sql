-- AlterTable
ALTER TABLE "Affiliate" ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankAccountNo" TEXT,
ADD COLUMN     "bankBranch" TEXT,
ADD COLUMN     "bankIban" TEXT,
ADD COLUMN     "bankLocation" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bankRoutingNo" TEXT,
ADD COLUMN     "bankSwiftCode" TEXT;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;
