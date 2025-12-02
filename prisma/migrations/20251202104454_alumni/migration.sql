/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Major" AS ENUM ('TEP', 'TPN', 'TIN');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('EMPLOYED', 'ENTREPRENEUR');

-- CreateEnum
CREATE TYPE "SalaryRange" AS ENUM ('LOW', 'MID', 'HIGH');

-- CreateEnum
CREATE TYPE "WorkIndustry" AS ENUM ('IT', 'FOOD', 'MANUFACTURE', 'FINANCE', 'EDUCATION', 'OTHER');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Alumni" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "class_year" INTEGER,
    "graduation_year" INTEGER,
    "major" "Major",
    "job_title" TEXT,
    "company" TEXT,
    "work_location" TEXT,
    "work_industry" TEXT,
    "salary_range" TEXT,
    "employment_type" "EmploymentType",
    "linkedin_link" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumni_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumni_email_key" ON "Alumni"("email");
