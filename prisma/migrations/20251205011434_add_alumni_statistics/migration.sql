-- CreateTable
CREATE TABLE "AlumniStatistics" (
    "id" TEXT NOT NULL,
    "totalAlumni" INTEGER NOT NULL DEFAULT 0,
    "tepAlumni" INTEGER NOT NULL DEFAULT 0,
    "tpnAlumni" INTEGER NOT NULL DEFAULT 0,
    "tinAlumni" INTEGER NOT NULL DEFAULT 0,
    "alumniBefore2010" INTEGER NOT NULL DEFAULT 0,
    "alumni2010_2015" INTEGER NOT NULL DEFAULT 0,
    "alumni2016_2020" INTEGER NOT NULL DEFAULT 0,
    "alumniAfter2020" INTEGER NOT NULL DEFAULT 0,
    "employedAlumni" INTEGER NOT NULL DEFAULT 0,
    "alumniByIndustry" JSONB,
    "alumniByLevel" JSONB,
    "alumniByIncome" JSONB,
    "alumniByCity" JSONB,
    "averageClassYear" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlumniStatistics_pkey" PRIMARY KEY ("id")
);
