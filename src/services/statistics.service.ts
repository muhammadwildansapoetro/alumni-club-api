import { prisma } from "../lib/prisma.ts";
import type {
  AlumniStatsPublicResponse,
  AlumniStatsDashboardResponse,
  AlumniSearchPublicResponse,
  AlumniSearchPublicQuery,
  JobStatsPublicResponse,
  JobStatsDashboardResponse,
  BusinessStatsPublicResponse,
  BusinessStatsDashboardResponse,
  AllStatsPublicResponse,
  AllStatsDashboardResponse,
  RefreshOptions,
} from "../types/statistics.types.js";

// Helper function to calculate class year range
const getClassYearRange = (classYear: number) => {
  if (classYear < 2010) return "before2010";
  if (classYear >= 2010 && classYear <= 2015) return "_2010_2015";
  if (classYear >= 2016 && classYear <= 2020) return "_2016_2020";
  return "after2020";
};

// Helper function to refresh alumni statistics
const refreshAlumniStatistics = async () => {
  // Get all alumni profiles with their employment data
  const alumnis = await prisma.alumni.findMany({
    include: {
      user: {
        select: {
          deletedAt: true,
        },
      },
    },
  });

  // Filter out deleted users
  const activeAlumni = alumnis.filter(alumni => !alumni.user.deletedAt);

  // Calculate basic statistics
  const totalAlumni = activeAlumni.length;

  // Department statistics
  const departmentStats = {
    tep: activeAlumni.filter(alumni => alumni.department === "TEP").length,
    tpn: activeAlumni.filter(alumni => alumni.department === "TPN").length,
    tin: activeAlumni.filter(alumni => alumni.department === "TIN").length,
  };

  // Class year range statistics
  const classYearStats = {
    before2010: 0,
    _2010_2015: 0,
    _2016_2020: 0,
    after2020: 0,
  };

  // Employment statistics
  const employedAlumni = activeAlumni.filter(alumni => alumni.jobTitle && alumni.companyName).length;

  const alumniByIndustry: Record<string, number> = {};
  const alumniByLevel: Record<string, number> = {};
  const alumniByIncome: Record<string, number> = {};
  const alumniByCity: Record<string, number> = {};

  let totalClassYear = 0;
  let classYearCount = 0;

  // Calculate detailed statistics
  activeAlumni.forEach(alumni => {
    // Class year range
    const range = getClassYearRange(alumni.classYear);
    classYearStats[range as keyof typeof classYearStats]++;

    // Average class year
    totalClassYear += alumni.classYear;
    classYearCount++;

    // Industry distribution
    if (alumni.industry) {
      alumniByIndustry[alumni.industry] = (alumniByIndustry[alumni.industry] || 0) + 1;
    }

    // Employment level distribution
    if (alumni.jobLevel) {
      alumniByLevel[alumni.jobLevel] = (alumniByLevel[alumni.jobLevel] || 0) + 1;
    }

    // Income range distribution
    if (alumni.incomeRange) {
      alumniByIncome[alumni.incomeRange] = (alumniByIncome[alumni.incomeRange] || 0) + 1;
    }

    // City distribution
    if (alumni.cityName) {
      alumniByCity[alumni.cityName] = (alumniByCity[alumni.cityName] || 0) + 1;
    }
  });

  const averageClassYear = classYearCount > 0 ? totalClassYear / classYearCount : null;

  // Structure the alumni data
  const alumniData = {
    departmentStats,
    classYearStats,
    employmentStats: {
      employedAlumni,
      alumniByIndustry,
      alumniByLevel,
      alumniByIncome,
    },
    geographicStats: {
      alumniByCity,
    },
    averageClassYear,
  };

  // Upsert statistics
  await prisma.statistics.upsert({
    where: { type: "ALUMNI" },
    update: {
      totalItems: totalAlumni,
      alumniData,
      lastUpdated: new Date(),
    },
    create: {
      type: "ALUMNI",
      totalItems: totalAlumni,
      alumniData,
    },
  });

  return true;
};

// Get alumni statistics for public landing page
export const getAlumniStatsPublicService = async (refresh: boolean = false): Promise<AlumniStatsPublicResponse> => {
  if (refresh) {
    await refreshAlumniStatistics();
  }

  const stats = await prisma.statistics.findUnique({
    where: { type: "ALUMNI" },
  });

  if (!stats || !stats.alumniData) {
    // If no statistics exist, create them
    await refreshAlumniStatistics();
    return getAlumniStatsPublicService(false);
  }

  const alumniData = stats.alumniData as any;

  const response: AlumniStatsPublicResponse = {
    totalAlumni: stats.totalItems,
    departmentStats: alumniData.departmentStats || { tep: 0, tpn: 0, tin: 0 },
    classYearStats: alumniData.classYearStats || {
      before2010: 0,
      _2010_2015: 0,
      _2016_2020: 0,
      after2020: 0,
    },
    employmentStats: {
      employedAlumni: alumniData.employmentStats?.employedAlumni || 0,
      alumniByIndustry: alumniData.employmentStats?.alumniByIndustry || {},
      alumniByLevel: alumniData.employmentStats?.alumniByLevel || {},
    },
    geographicStats: {
      alumniByCity: alumniData.geographicStats?.alumniByCity || {},
    },
    averageClassYear: alumniData.averageClassYear || null,
    lastUpdated: stats.lastUpdated.toISOString(),
  };

  return response;
};

// Get alumni statistics for user dashboard (includes sensitive income data)
export const getAlumniStatsDashboardService = async (refresh: boolean = false, includeIncome: boolean = true): Promise<AlumniStatsDashboardResponse> => {
  if (refresh) {
    await refreshAlumniStatistics();
  }

  const stats = await prisma.statistics.findUnique({
    where: { type: "ALUMNI" },
  });

  if (!stats || !stats.alumniData) {
    await refreshAlumniStatistics();
    return getAlumniStatsDashboardService(false, includeIncome);
  }

  const alumniData = stats.alumniData as any;

  const response: AlumniStatsDashboardResponse = {
    totalAlumni: stats.totalItems,
    departmentStats: alumniData.departmentStats || { tep: 0, tpn: 0, tin: 0 },
    classYearStats: alumniData.classYearStats || {
      before2010: 0,
      _2010_2015: 0,
      _2016_2020: 0,
      after2020: 0,
    },
    employmentStats: {
      employedAlumni: alumniData.employmentStats?.employedAlumni || 0,
      alumniByIndustry: alumniData.employmentStats?.alumniByIndustry || {},
      alumniByLevel: alumniData.employmentStats?.alumniByLevel || {},
    },
    geographicStats: {
      alumniByCity: alumniData.geographicStats?.alumniByCity || {},
    },
    averageClassYear: alumniData.averageClassYear || null,
    lastUpdated: stats.lastUpdated.toISOString(),
    incomeStats: includeIncome ? {
      alumniByIncome: alumniData.employmentStats?.alumniByIncome || {},
    } : { alumniByIncome: {} },
  };

  return response;
};

// Search and filter alumni for public landing page
export const searchAlumniPublicService = async (query: AlumniSearchPublicQuery) => {
  const { page, limit, search, department, classYearFrom, classYearTo, city, industry, jobLevel, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    user: {
      deletedAt: null,
    },
  };

  // Add search filter (search in fullName and companyName)
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
    ];
  }

  // Add specific filters
  if (department) where.department = department;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (industry) where.industry = industry;
  if (jobLevel) where.jobLevel = jobLevel;

  // Add class year range filter
  if (classYearFrom || classYearTo) {
    where.classYear = {};
    if (classYearFrom) where.classYear.gte = classYearFrom;
    if (classYearTo) where.classYear.lte = classYearTo;
  }

  // Build order by clause
  const orderBy: any = {};
  switch (sortBy) {
    case "name":
      orderBy.fullName = sortOrder;
      break;
    case "classYear":
      orderBy.classYear = sortOrder;
      break;
    case "department":
      orderBy.department = sortOrder;
      break;
    case "createdAt":
      orderBy.createdAt = sortOrder;
      break;
    default:
      orderBy.fullName = "asc";
  }

  // Execute query
  const [alumni, total] = await Promise.all([
    prisma.alumni.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        department: true,
        classYear: true,
        cityId: true,
        cityName: true,
        provinceId: true,
        provinceName: true,
        countryId: true,
        countryName: true,
        industry: true,
        jobTitle: true,
        companyName: true,
        jobLevel: true,
      },
      skip,
      take: limit,
      orderBy,
    }),
    prisma.alumni.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Transform alumni data to match response type
  const transformedAlumni = alumni.map(alum => ({
    id: alum.id,
    fullName: alum.fullName,
    department: alum.department,
    classYear: alum.classYear,
    city: alum.cityName || undefined,
    industry: alum.industry || undefined,
    jobTitle: alum.jobTitle || undefined,
    companyName: alum.companyName || undefined,
    jobLevel: alum.jobLevel || undefined,
  }));

  const response: AlumniSearchPublicResponse = {
    alumni: transformedAlumni,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
    filters: {
      search,
      department,
      classYearFrom,
      classYearTo,
      city,
      industry,
      jobLevel,
    },
  };

  return response;
};

// ===== JOB POSTING STATISTICS FUNCTIONS =====

// Helper function to refresh job posting statistics
const refreshJobStatistics = async () => {
  // Get all job postings
  const jobss = await prisma.jobs.findMany({
    include: {
      user: {
        select: {
          deletedAt: true,
        },
      },
    },
  });

  // Filter out deleted users
  const activeJobPostings = jobss.filter(job => !job.user.deletedAt);

  // Calculate basic statistics
  const totalJobs = activeJobPostings.length;
  const activeJobs = activeJobPostings.filter(job => job.isActive).length;
  const inactiveJobs = totalJobs - activeJobs;

  // Job type statistics
  const jobTypeStats: Record<string, number> = {};
  const locationStats: Record<string, number> = {};
  const companyStats: Record<string, number> = {};
  const industryStats: Record<string, number> = {};

  let salaryMinTotal = 0;
  let salaryMaxTotal = 0;
  let salaryCount = 0;

  // Calculate detailed statistics
  activeJobPostings.forEach(job => {
    // Job type distribution
    if (job.jobType) {
      jobTypeStats[job.jobType] = (jobTypeStats[job.jobType] || 0) + 1;
    }

    // Location distribution
    if (job.location) {
      locationStats[job.location] = (locationStats[job.location] || 0) + 1;
    }

    // Company distribution
    if (job.company) {
      companyStats[job.company] = (companyStats[job.company] || 0) + 1;
    }

    // Extract salary information from salaryRange
    if (job.salaryRange) {
      const salaryMatch = job.salaryRange.match(/(\d+).?(\d*)\s*-\s*(\d+).?(\d*)/);
      if (salaryMatch) {
        const minSalary = parseInt(salaryMatch[1] + (salaryMatch[2] || '0'));
        const maxSalary = parseInt(salaryMatch[3] + (salaryMatch[4] || '0'));
        salaryMinTotal += minSalary;
        salaryMaxTotal += maxSalary;
        salaryCount++;
      }
    }
  });

  const averageSalaryRange = salaryCount > 0
    ? `${Math.round(salaryMinTotal / salaryCount)}-${Math.round(salaryMaxTotal / salaryCount)}`
    : null;

  // Calculate industry distribution from alumni profiles who posted jobs
  const jobPosters = await prisma.alumni.findMany({
    where: {
      userId: {
        in: activeJobPostings.map(job => job.userId),
      },
    },
    select: {
      industry: true,
    },
  });

  jobPosters.forEach(profile => {
    if (profile.industry) {
      industryStats[profile.industry] = (industryStats[profile.industry] || 0) + 1;
    }
  });

  // Time-based statistics
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const jobsThisMonth = activeJobPostings.filter(job => job.createdAt >= thisMonth).length;
  const jobsLastMonth = activeJobPostings.filter(job =>
    job.createdAt >= lastMonth && job.createdAt < thisMonth
  ).length;

  // Structure the job data
  const jobsData = {
    totalJobs,
    activeJobs,
    inactiveJobs,
    jobTypeStats,
    locationStats,
    companyStats,
    industryStats,
    averageSalaryRange,
    salaryStats: {
      salaryRangeDistribution: {},
      averageSalaryMin: salaryCount > 0 ? Math.round(salaryMinTotal / salaryCount) : null,
      averageSalaryMax: salaryCount > 0 ? Math.round(salaryMaxTotal / salaryCount) : null,
    },
    timeStats: {
      jobPostingTrends: {
        thisMonth: jobsThisMonth,
        lastMonth: jobsLastMonth,
        growth: jobsLastMonth > 0 ? ((jobsThisMonth - jobsLastMonth) / jobsLastMonth) * 100 : 0,
      },
      avgTimeToFill: null, // Would need application data to calculate
    },
  };

  // Upsert statistics
  await prisma.statistics.upsert({
    where: { type: "JOBS" },
    update: {
      totalItems: totalJobs,
      jobsData,
      lastUpdated: new Date(),
    },
    create: {
      type: "JOBS",
      totalItems: totalJobs,
      jobsData,
    },
  });

  return true;
};

// Get job posting statistics for public landing page
export const getJobStatsPublicService = async (refresh: boolean = false): Promise<JobStatsPublicResponse> => {
  if (refresh) {
    await refreshJobStatistics();
  }

  const stats = await prisma.statistics.findUnique({
    where: { type: "JOBS" },
  });

  if (!stats || !stats.jobsData) {
    // If no statistics exist, create them
    await refreshJobStatistics();
    return getJobStatsPublicService(false);
  }

  const jobsData = stats.jobsData as any;

  const response: JobStatsPublicResponse = {
    totalJobs: jobsData.totalJobs || 0,
    activeJobs: jobsData.activeJobs || 0,
    inactiveJobs: jobsData.inactiveJobs || 0,
    jobTypeStats: jobsData.jobTypeStats || {},
    locationStats: jobsData.locationStats || {},
    companyStats: jobsData.companyStats || {},
    industryStats: jobsData.industryStats || {},
    averageSalaryRange: jobsData.averageSalaryRange || null,
    lastUpdated: stats.lastUpdated.toISOString(),
  };

  return response;
};

// Get job posting statistics for user dashboard (includes sensitive data)
export const getJobStatsDashboardService = async (
  refresh: boolean = false,
  includeSalaryDetails: boolean = true,
  includeApplicationStats: boolean = false
): Promise<JobStatsDashboardResponse> => {
  if (refresh) {
    await refreshJobStatistics();
  }

  const stats = await prisma.statistics.findUnique({
    where: { type: "JOBS" },
  });

  if (!stats || !stats.jobsData) {
    await refreshJobStatistics();
    return getJobStatsDashboardService(false, includeSalaryDetails, includeApplicationStats);
  }

  const jobsData = stats.jobsData as any;

  const response: JobStatsDashboardResponse = {
    totalJobs: jobsData.totalJobs || 0,
    activeJobs: jobsData.activeJobs || 0,
    inactiveJobs: jobsData.inactiveJobs || 0,
    jobTypeStats: jobsData.jobTypeStats || {},
    locationStats: jobsData.locationStats || {},
    companyStats: jobsData.companyStats || {},
    industryStats: jobsData.industryStats || {},
    averageSalaryRange: jobsData.averageSalaryRange || null,
    salaryStats: includeSalaryDetails ? {
      salaryRangeDistribution: jobsData.salaryStats?.salaryRangeDistribution || {},
      averageSalaryMin: jobsData.salaryStats?.averageSalaryMin || null,
      averageSalaryMax: jobsData.salaryStats?.averageSalaryMax || null,
    } : {
      salaryRangeDistribution: {},
      averageSalaryMin: null,
      averageSalaryMax: null,
    },
    applicationStats: includeApplicationStats ? {
      totalApplications: 0, // Would need application tracking
      avgApplicationsPerJob: 0,
      applicationRate: 0,
    } : undefined,
    timeStats: jobsData.timeStats || {
      avgTimeToFill: null,
      jobPostingTrends: {
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
      },
    },
    lastUpdated: stats.lastUpdated.toISOString(),
  };

  return response;
};

// ===== BUSINESS POSTING STATISTICS FUNCTIONS =====

// Helper function to refresh business posting statistics
const refreshBusinessStatistics = async () => {
  // Get all business listings
  const businessListings = await prisma.business.findMany({
    include: {
      user: {
        select: {
          deletedAt: true,
        },
      },
    },
  });

  // Filter out deleted users
  const activeBusinessListings = businessListings.filter(business => !business.user.deletedAt);

  // Calculate basic statistics
  const totalBusinesses = activeBusinessListings.length;
  const activeBusinesses = activeBusinessListings.filter(business => business.isActive).length;
  const inactiveBusinesses = totalBusinesses - activeBusinesses;

  // Category statistics
  const categoryStats: Record<string, number> = {};
  const locationStats: Record<string, number> = {};

  let withWebsite = 0;
  let withContactInfo = 0;

  // Calculate detailed statistics
  activeBusinessListings.forEach(business => {
    // Category distribution
    if (business.category) {
      categoryStats[business.category] = (categoryStats[business.category] || 0) + 1;
    }

    // Location distribution
    if (business.location) {
      locationStats[business.location] = (locationStats[business.location] || 0) + 1;
    }

    // Website statistics
    if (business.website) {
      withWebsite++;
    }

    // Contact information statistics
    if (business.contactInfo) {
      withContactInfo++;
    }
  });

  const websiteRate = totalBusinesses > 0 ? (withWebsite / totalBusinesses) * 100 : 0;
  const contactInfoRate = totalBusinesses > 0 ? (withContactInfo / totalBusinesses) * 100 : 0;

  // Time-based statistics
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const businessesThisMonth = activeBusinessListings.filter(business => business.createdAt >= thisMonth).length;
  const businessesLastMonth = activeBusinessListings.filter(business =>
    business.createdAt >= lastMonth && business.createdAt < thisMonth
  ).length;

  // Structure the business data
  const businessData = {
    totalBusinesses,
    activeBusinesses,
    inactiveBusinesses,
    categoryStats,
    locationStats,
    websiteStats: {
      withWebsite,
      withoutWebsite: totalBusinesses - withWebsite,
      websiteRate,
    },
    contactStats: {
      withContactInfo,
      withoutContactInfo: totalBusinesses - withContactInfo,
      contactInfoRate,
    },
    growthStats: {
      newBusinessesThisMonth: businessesThisMonth,
      newBusinessesLastMonth: businessesLastMonth,
      growth: businessesLastMonth > 0 ? ((businessesThisMonth - businessesLastMonth) / businessesLastMonth) * 100 : 0,
    },
  };

  // Upsert statistics
  await prisma.statistics.upsert({
    where: { type: "BUSINESS" },
    update: {
      totalItems: totalBusinesses,
      businessData,
      lastUpdated: new Date(),
    },
    create: {
      type: "BUSINESS",
      totalItems: totalBusinesses,
      businessData,
    },
  });

  return true;
};

// Get business posting statistics for public landing page
export const getBusinessStatsPublicService = async (refresh: boolean = false): Promise<BusinessStatsPublicResponse> => {
  if (refresh) {
    await refreshBusinessStatistics();
  }

  const stats = await prisma.statistics.findUnique({
    where: { type: "BUSINESS" },
  });

  if (!stats || !stats.businessData) {
    // If no statistics exist, create them
    await refreshBusinessStatistics();
    return getBusinessStatsPublicService(false);
  }

  const businessData = stats.businessData as any;

  const response: BusinessStatsPublicResponse = {
    totalBusinesses: businessData.totalBusinesses || 0,
    activeBusinesses: businessData.activeBusinesses || 0,
    inactiveBusinesses: businessData.inactiveBusinesses || 0,
    categoryStats: businessData.categoryStats || {},
    locationStats: businessData.locationStats || {},
    websiteStats: businessData.websiteStats || {
      withWebsite: 0,
      withoutWebsite: 0,
      websiteRate: 0,
    },
    lastUpdated: stats.lastUpdated.toISOString(),
  };

  return response;
};

// Get business posting statistics for user dashboard (includes sensitive data)
export const getBusinessStatsDashboardService = async (
  refresh: boolean = false,
  includeRevenueData: boolean = false,
  includeContactStats: boolean = true
): Promise<BusinessStatsDashboardResponse> => {
  if (refresh) {
    await refreshBusinessStatistics();
  }

  const stats = await prisma.statistics.findUnique({
    where: { type: "BUSINESS" },
  });

  if (!stats || !stats.businessData) {
    await refreshBusinessStatistics();
    return getBusinessStatsDashboardService(false, includeRevenueData, includeContactStats);
  }

  const businessData = stats.businessData as any;

  const response: BusinessStatsDashboardResponse = {
    totalBusinesses: businessData.totalBusinesses || 0,
    activeBusinesses: businessData.activeBusinesses || 0,
    inactiveBusinesses: businessData.inactiveBusinesses || 0,
    categoryStats: businessData.categoryStats || {},
    locationStats: businessData.locationStats || {},
    websiteStats: businessData.websiteStats || {
      withWebsite: 0,
      withoutWebsite: 0,
      websiteRate: 0,
    },
    contactStats: includeContactStats ? businessData.contactStats || {
      withContactInfo: 0,
      withoutContactInfo: 0,
      contactInfoRate: 0,
    } : undefined,
    revenueStats: includeRevenueData ? {
      revenueDistribution: {},
      totalRevenue: undefined, // Would need revenue data from businesses
      avgRevenuePerBusiness: undefined,
    } : undefined,
    growthStats: businessData.growthStats || {
      newBusinessesThisMonth: 0,
      newBusinessesLastMonth: 0,
      growth: 0,
    },
    lastUpdated: stats.lastUpdated.toISOString(),
  };

  return response;
};

// ===== COMBINED STATISTICS FUNCTIONS =====

// Get combined statistics for public landing page
export const getAllStatsPublicService = async (refreshOptions: RefreshOptions = {}): Promise<AllStatsPublicResponse> => {
  const [alumniStats, jobStats, businessStats] = await Promise.all([
    refreshOptions.alumni ? refreshAlumniStatistics().then(() => getAlumniStatsPublicService(false)) : getAlumniStatsPublicService(refreshOptions.refresh),
    refreshOptions.jobs ? refreshJobStatistics().then(() => getJobStatsPublicService(false)) : getJobStatsPublicService(refreshOptions.refresh),
    refreshOptions.business ? refreshBusinessStatistics().then(() => getBusinessStatsPublicService(false)) : getBusinessStatsPublicService(refreshOptions.refresh),
  ]);

  const totalItems = alumniStats.totalAlumni + jobStats.totalJobs + businessStats.totalBusinesses;
  const lastUpdated = new Date().toISOString();

  return {
    alumni: alumniStats,
    jobs: jobStats,
    business: businessStats,
    overview: {
      totalItems,
      lastUpdated,
    },
  };
};

// Get combined statistics for user dashboard
export const getAllStatsDashboardService = async (
  refreshOptions: RefreshOptions = {},
  includeIncome: boolean = true,
  includeSalaryDetails: boolean = true,
  includeRevenueData: boolean = false
): Promise<AllStatsDashboardResponse> => {
  const [alumniStats, jobStats, businessStats] = await Promise.all([
    refreshOptions.alumni ? refreshAlumniStatistics().then(() => getAlumniStatsDashboardService(false, includeIncome)) : getAlumniStatsDashboardService(refreshOptions.refresh, includeIncome),
    refreshOptions.jobs ? refreshJobStatistics().then(() => getJobStatsDashboardService(false, includeSalaryDetails, false)) : getJobStatsDashboardService(refreshOptions.refresh, includeSalaryDetails, false),
    refreshOptions.business ? refreshBusinessStatistics().then(() => getBusinessStatsDashboardService(false, includeRevenueData, true)) : getBusinessStatsDashboardService(refreshOptions.refresh, includeRevenueData, true),
  ]);

  const totalItems = alumniStats.totalAlumni + jobStats.totalJobs + businessStats.totalBusinesses;
  const totalActiveItems = alumniStats.employmentStats.employedAlumni + jobStats.activeJobs + businessStats.activeBusinesses;
  const lastUpdated = new Date().toISOString();

  // Calculate platform health metrics
  const userEngagement = Math.min(100, (totalActiveItems / totalItems) * 100);
  const contentFreshness = Math.min(100, ((jobStats.timeStats?.jobPostingTrends.growth || 0) + 50) / 1.5);
  const dataCompleteness = Math.min(100, (businessStats.websiteStats.websiteRate + 50) / 1.5);

  return {
    alumni: alumniStats,
    jobs: jobStats,
    business: businessStats,
    overview: {
      totalItems,
      totalActiveItems,
      lastUpdated,
      platformHealth: {
        userEngagement: Math.round(userEngagement),
        contentFreshness: Math.round(contentFreshness),
        dataCompleteness: Math.round(dataCompleteness),
      },
    },
  };
};