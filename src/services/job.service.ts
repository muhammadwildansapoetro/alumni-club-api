import { prisma } from "../lib/prisma.ts";

// CREATE - Create new job posting (authenticated users)
export const createJobPostingService = async (
  userId: string,
  data: {
    title: string;
    description: string;
    company?: string;
    location?: string;
    jobType?: string;
    salaryRange?: string;
    externalUrl?: string;
  }
) => {
  const jobPosting = await prisma.jobPosting.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      company: data.company,
      location: data.location,
      jobType: data.jobType,
      salaryRange: data.salaryRange,
      externalUrl: data.externalUrl,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      company: true,
      location: true,
      jobType: true,
      salaryRange: true,
      externalUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              department: true,
              classYear: true,
            },
          },
        },
      },
    },
  });

  return jobPosting;
};

// READ - Get all job postings (public, with pagination and filters)
export const getAllJobPostingsService = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  location?: string,
  jobType?: string,
  company?: string,
  isActive?: boolean
) => {
  const skip = (page - 1) * limit;

  // Build filter conditions
  const whereCondition: any = {};

  if (search) {
    whereCondition.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ];
  }

  if (location) {
    whereCondition.location = { contains: location, mode: "insensitive" };
  }

  if (jobType) {
    whereCondition.jobType = jobType;
  }

  if (company) {
    whereCondition.company = { contains: company, mode: "insensitive" };
  }

  if (isActive !== undefined) {
    whereCondition.isActive = isActive;
  }

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        company: true,
        location: true,
        jobType: true,
        salaryRange: true,
        externalUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                department: true,
                classYear: true,
              },
            },
          },
        },
      },
    }),
    prisma.jobPosting.count({ where: whereCondition }),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// READ - Get job posting by ID (public)
export const getJobPostingByIdService = async (jobId: string) => {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      company: true,
      location: true,
      jobType: true,
      salaryRange: true,
      externalUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              department: true,
              classYear: true,
              city: true,
              industry: true,
            },
          },
        },
      },
    },
  });

  if (!job) {
    throw new Error("Lowongan kerja tidak ditemukan");
  }

  return job;
};

// UPDATE - Update job posting (owner or admin)
export const updateJobPostingService = async (
  jobId: string,
  data: {
    title?: string;
    description?: string;
    company?: string;
    location?: string;
    jobType?: string;
    salaryRange?: string;
    externalUrl?: string;
    isActive?: boolean;
  }
) => {
  const existingJob = await prisma.jobPosting.findUnique({
    where: { id: jobId },
  });

  if (!existingJob) {
    throw new Error("Lowongan kerja tidak ditemukan");
  }

  const updatedJob = await prisma.jobPosting.update({
    where: { id: jobId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      description: true,
      company: true,
      location: true,
      jobType: true,
      salaryRange: true,
      externalUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              department: true,
              classYear: true,
            },
          },
        },
      },
    },
  });

  return updatedJob;
};

// DELETE - Delete job posting (owner or admin)
export const deleteJobPostingService = async (jobId: string) => {
  const existingJob = await prisma.jobPosting.findUnique({
    where: { id: jobId },
  });

  if (!existingJob) {
    throw new Error("Lowongan kerja tidak ditemukan");
  }

  await prisma.jobPosting.delete({
    where: { id: jobId },
  });

  return { message: "Lowongan kerja berhasil dihapus" };
};