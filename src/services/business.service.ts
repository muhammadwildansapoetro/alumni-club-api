import { prisma } from "../lib/prisma.ts";

// CREATE - Create new business listing (authenticated users)
export const createBusinessListingService = async (
  userId: string,
  data: {
    businessName: string;
    description: string;
    category?: string;
    location?: string;
    website?: string;
    contactInfo?: string;
  }
) => {
  const businessListing = await prisma.business.create({
    data: {
      userId,
      businessName: data.businessName,
      description: data.description,
      category: data.category,
      location: data.location,
      website: data.website,
      contactInfo: data.contactInfo,
      isActive: true,
    },
    select: {
      id: true,
      businessName: true,
      description: true,
      category: true,
      location: true,
      website: true,
      contactInfo: true,
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

  return businessListing;
};

// READ - Get all business listings (public, with pagination and filters)
export const getAllBusinessListingsService = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string,
  location?: string,
  isActive?: boolean
) => {
  const skip = (page - 1) * limit;

  // Build filter conditions
  const whereCondition: any = {};

  if (search) {
    whereCondition.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    whereCondition.category = { contains: category, mode: "insensitive" };
  }

  if (location) {
    whereCondition.location = { contains: location, mode: "insensitive" };
  }

  if (isActive !== undefined) {
    whereCondition.isActive = isActive;
  }

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        businessName: true,
        description: true,
        category: true,
        location: true,
        website: true,
        contactInfo: true,
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
    prisma.business.count({ where: whereCondition }),
  ]);

  return {
    businesses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// READ - Get business listing by ID (public)
export const getBusinessListingByIdService = async (businessId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      businessName: true,
      description: true,
      category: true,
      location: true,
      website: true,
      contactInfo: true,
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
              cityId: true,
              cityName: true,
              provinceId: true,
              provinceName: true,
              industry: true,
            },
          },
        },
      },
    },
  });

  if (!business) {
    throw new Error("Direktori bisnis tidak ditemukan");
  }

  return business;
};

// UPDATE - Update business listing (owner or admin)
export const updateBusinessListingService = async (
  businessId: string,
  data: {
    businessName?: string;
    description?: string;
    category?: string;
    location?: string;
    website?: string;
    contactInfo?: string;
    isActive?: boolean;
  }
) => {
  const existingBusiness = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!existingBusiness) {
    throw new Error("Direktori bisnis tidak ditemukan");
  }

  const updatedBusiness = await prisma.business.update({
    where: { id: businessId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      businessName: true,
      description: true,
      category: true,
      location: true,
      website: true,
      contactInfo: true,
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

  return updatedBusiness;
};

// DELETE - Delete business listing (owner or admin)
export const deleteBusinessListingService = async (businessId: string) => {
  const existingBusiness = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!existingBusiness) {
    throw new Error("Direktori bisnis tidak ditemukan");
  }

  await prisma.business.delete({
    where: { id: businessId },
  });

  return { message: "Direktori bisnis berhasil dihapus" };
};