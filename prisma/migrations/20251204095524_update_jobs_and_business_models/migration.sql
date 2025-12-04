/*
  Warnings:

  - You are about to drop the `BusinessPosting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BusinessPosting" DROP CONSTRAINT "BusinessPosting_userId_fkey";

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jobType" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "salaryRange" TEXT;

-- DropTable
DROP TABLE "BusinessPosting";

-- CreateTable
CREATE TABLE "BusinessDirectory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "website" TEXT,
    "contactInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessDirectory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BusinessDirectory" ADD CONSTRAINT "BusinessDirectory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
