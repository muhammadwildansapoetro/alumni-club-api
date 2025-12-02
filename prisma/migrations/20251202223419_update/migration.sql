/*
  Warnings:

  - You are about to drop the `Alumni` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('TEP', 'TPN', 'TIN');

-- CreateEnum
CREATE TYPE "EmploymentLevel" AS ENUM ('INTERN', 'STAFF', 'SUPERVISOR', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'VP', 'C_LEVEL', 'FOUNDER', 'OTHER');

-- CreateEnum
CREATE TYPE "IncomeRange" AS ENUM ('BELOW_5M', 'RANGE_5_10M', 'RANGE_10_20M', 'ABOVE_20M', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "IndustryField" AS ENUM ('AGRICULTURE', 'FOOD_TECH', 'BIOTECH', 'RESEARCH', 'EDUCATION', 'ENGINEERING', 'BUSINESS', 'MARKETING', 'FINANCE', 'GOVERNMENT', 'FREELANCE', 'OTHER');

-- DropTable
DROP TABLE "Alumni";

-- DropEnum
DROP TYPE "EmploymentType";

-- DropEnum
DROP TYPE "Major";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SalaryRange";

-- DropEnum
DROP TYPE "WorkIndustry";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "classYear" INTEGER NOT NULL,
    "city" TEXT,
    "industry" "IndustryField",
    "employmentLevel" "EmploymentLevel",
    "incomeRange" "IncomeRange",
    "jobTitle" TEXT,
    "companyName" TEXT,
    "linkedInUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlumniProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company" TEXT,
    "externalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPosting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productName" TEXT,
    "priceStartFrom" INTEGER,
    "externalUrl" TEXT,
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPosting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniProfile_userId_key" ON "AlumniProfile"("userId");

-- AddForeignKey
ALTER TABLE "AlumniProfile" ADD CONSTRAINT "AlumniProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPosting" ADD CONSTRAINT "BusinessPosting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
