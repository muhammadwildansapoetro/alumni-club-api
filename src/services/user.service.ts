import { prisma } from "../lib/prisma.ts";
import type { UserRole } from "../../generated/prisma/index.js";

export const createUserService = async (data: {
  email: string;
  name: string;
  role: UserRole;
  npm: string;
  department: string;
  classYear: number;
  fullName?: string;
}) => {
  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // Transaction for atomic creation
  const result = await prisma.$transaction(async (tx) => {
    // Create User
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
      },
    });

    // Create AlumniProfile
    const alumni = await tx.alumni.create({
      data: {
        userId: user.id,
        npm: data.npm,
        fullName: data.fullName || data.name,
        department: data.department as any,
        classYear: data.classYear,
      },
    });

    return { user, alumni };
  });

  return result;
};

export const getAllUsersService = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  department?: string,
  classYear?: number,
  cityId?: number,
  provinceId?: number,
  countryId?: number,
  industry?: string,
  jobLevel?: string,
  status?: string
) => {
  const skip = (page - 1) * limit;

  // Build dynamic where condition
  const whereCondition: any = {
    deletedAt: null,
  };

  // Build profile filter
  const profileFilter: any = {};

  if (department) profileFilter.department = department;
  if (classYear) profileFilter.classYear = classYear;
  if (cityId) profileFilter.cityId = cityId;
  if (provinceId) profileFilter.provinceId = provinceId;
  if (countryId) profileFilter.countryId = countryId;
  if (industry) profileFilter.industry = industry;
  if (jobLevel) profileFilter.jobLevel = jobLevel;
  if (status) profileFilter.status = status;

  // Apply profile filter if any exists
  if (Object.keys(profileFilter).length > 0) {
    whereCondition.profile = profileFilter;
  } else {
    // Ensure user has a profile
    whereCondition.profile = { isNot: null };
  }

  // Search by name, email, or fullName
  if (search) {
    whereCondition.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { profile: { fullName: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: {
          select: {
            id: true,
            fullName: true,
            department: true,
            classYear: true,
            graduationYear: true,
            highestEducation: true,
            cityId: true,
            cityName: true,
            provinceId: true,
            provinceName: true,
            countryId: true,
            countryName: true,
            industry: true,
            jobLevel: true,
            incomeRange: true,
            jobTitle: true,
            companyName: true,
            linkedInUrl: true,
            status: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          npm: true,
          department: true,
          classYear: true,
          graduationYear: true,
          highestEducation: true,
          cityId: true,
          cityName: true,
          provinceId: true,
          provinceName: true,
          countryId: true,
          countryName: true,
          industry: true,
          jobLevel: true,
          incomeRange: true,
          jobTitle: true,
          companyName: true,
          linkedInUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }

  return user;
};

export const updateOwnProfileService = async (
  userId: string,
  profileData: {
    fullName?: string;
    cityId?: number;
    cityName?: string;
    provinceId?: number;
    provinceName?: string;
    countryId?: number;
    countryName?: string;
    industry?: any;
    jobLevel?: any;
    incomeRange?: any;
    jobTitle?: string;
    companyName?: string;
    linkedInUrl?: string;
    graduationYear?: number;
    highestEducation?: any;
    status?: any;
  }
) => {
  // Check user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new Error("Pengguna tidak ditemukan");
  }

  // Update existing profile (must exist)
  const updatedProfile = await prisma.alumni.update({
    where: { userId },
    data: profileData,
    select: {
      id: true,
      userId: true,
      npm: true,
      fullName: true,
      department: true,
      classYear: true,
      graduationYear: true,
      highestEducation: true,
      cityId: true,
      cityName: true,
      provinceId: true,
      provinceName: true,
      countryId: true,
      countryName: true,
      industry: true,
      jobLevel: true,
      incomeRange: true,
      jobTitle: true,
      companyName: true,
      linkedInUrl: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedProfile;
};

export const softDeleteUserService = async (
  userId: string,
  requestingUserId: string
) => {
  // Prevent self-deletion
  if (userId === requestingUserId) {
    throw new Error("Admin tidak dapat menghapus akun sendiri");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new Error("Pengguna tidak ditemukan");
  }

  // Prevent deleting other admins
  if (existingUser.role === "ADMIN") {
    throw new Error("Admin tidak dapat menghapus akun admin lain");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  return { message: "Pengguna berhasil dihapus" };
};
