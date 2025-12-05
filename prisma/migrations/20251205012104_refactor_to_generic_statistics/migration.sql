/*
  Warnings:

  - You are about to drop the `AlumniStatistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatisticsType" AS ENUM ('ALUMNI', 'JOB_POSTINGS', 'BUSINESS_POSTINGS');

-- DropTable
DROP TABLE "AlumniStatistics";

-- CreateTable
CREATE TABLE "Statistics" (
    "id" TEXT NOT NULL,
    "type" "StatisticsType" NOT NULL,
    "alumniData" JSONB,
    "jobData" JSONB,
    "businessData" JSONB,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Statistics_type_key" ON "Statistics"("type");
