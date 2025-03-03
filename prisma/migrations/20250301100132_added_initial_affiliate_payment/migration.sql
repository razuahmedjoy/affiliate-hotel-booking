-- CreateTable
CREATE TABLE "InitialAffiliatePayment" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "transactionId" TEXT,
    "affiliateId" TEXT,
    "customerId" TEXT,

    CONSTRAINT "InitialAffiliatePayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InitialAffiliatePayment" ADD CONSTRAINT "InitialAffiliatePayment_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("uniqueCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitialAffiliatePayment" ADD CONSTRAINT "InitialAffiliatePayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
