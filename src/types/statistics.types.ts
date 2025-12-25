import { z } from "zod";

// ===== ALUMNI STATISTICS TYPES =====

// Query parameters for alumni statistics (public)
export const alumniStatsPublicQuerySchema = z.object({
  refresh: z
    .string()
    .regex(/^(true|false)$/, "Refresh harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// Query parameters for alumni statistics (dashboard - includes sensitive data)
export const alumniStatsDashboardQuerySchema = alumniStatsPublicQuerySchema.extend({
  includeIncome: z
    .string()
    .regex(/^(true|false)$/, "Include income harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// ===== JOB POSTING STATISTICS TYPES =====

// Query parameters for job posting statistics (public)
export const jobStatsPublicQuerySchema = z.object({
  refresh: z
    .string()
    .regex(/^(true|false)$/, "Refresh harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// Query parameters for job posting statistics (dashboard - includes sensitive data)
export const jobStatsDashboardQuerySchema = jobStatsPublicQuerySchema.extend({
  includeSalaryDetails: z
    .string()
    .regex(/^(true|false)$/, "Include salary details harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
  includeApplicationStats: z
    .string()
    .regex(/^(true|false)$/, "Include application stats harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// ===== BUSINESS POSTING STATISTICS TYPES =====

// Query parameters for business posting statistics (public)
export const businessStatsPublicQuerySchema = z.object({
  refresh: z
    .string()
    .regex(/^(true|false)$/, "Refresh harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// Query parameters for business posting statistics (dashboard - includes sensitive data)
export const businessStatsDashboardQuerySchema = businessStatsPublicQuerySchema.extend({
  includeRevenueData: z
    .string()
    .regex(/^(true|false)$/, "Include revenue data harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
  includeContactStats: z
    .string()
    .regex(/^(true|false)$/, "Include contact stats harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// ===== COMBINED STATISTICS TYPES =====

// Query parameters for combined statistics (public)
export const allStatsPublicQuerySchema = z.object({
  refresh: z
    .string()
    .regex(/^(true|false)$/, "Refresh harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
  refreshAlumni: z
    .string()
    .regex(/^(true|false)$/, "Refresh alumni harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
  refreshJobs: z
    .string()
    .regex(/^(true|false)$/, "Refresh jobs harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
  refreshBusiness: z
    .string()
    .regex(/^(true|false)$/, "Refresh business harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// Query parameters for combined statistics (dashboard)
export const allStatsDashboardQuerySchema = allStatsPublicQuerySchema.extend({
  includeIncome: z
    .string()
    .regex(/^(true|false)$/, "Include income harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
  includeSalaryDetails: z
    .string()
    .regex(/^(true|false)$/, "Include salary details harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
  includeRevenueData: z
    .string()
    .regex(/^(true|false)$/, "Include revenue data harus berupa 'true' atau 'false'")
    .transform(val => val === 'true')
    .optional(),
});

// ===== ALUMNI SEARCH TYPES (from existing alumni.types.ts) =====

// Enhanced query parameters for alumni search (public landing page)
export const alumniSearchPublicSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page harus berupa angka")
    .default("1")
    .transform(Number),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit harus berupa angka")
    .default("12")
    .transform(Number)
    .refine(val => val <= 50, "Limit maksimal 50"),

  // Search filters
  search: z.string().max(100, "Search query maksimal 100 karakter").optional(),
  department: z.enum(["TEP", "TPN", "TIN"]).optional(),
  classYearFrom: z
    .string()
    .regex(/^\d+$/, "Tahun awal harus berupa angka")
    .transform(Number)
    .refine(val => val >= 1960, "Tahun awal tidak valid")
    .optional(),
  classYearTo: z
    .string()
    .regex(/^\d+$/, "Tahun akhir harus berupa angka")
    .transform(Number)
    .refine(val => val <= new Date().getFullYear(), "Tahun akhir tidak valid")
    .optional(),
  city: z.string().max(100, "Kota maksimal 100 karakter").optional(),
  industry: z.enum([
    "AGRICULTURE",
    "FOOD_TECH",
    "BIOTECH",
    "RESEARCH",
    "EDUCATION",
    "ENGINEERING",
    "BUSINESS",
    "MARKETING",
    "FINANCE",
    "GOVERNMENT",
    "OTHER",
    // Agricultural Industrial Technology
    "HORTICULTURE",
    "PLANTATION",
    "LIVESTOCK",
    "FISHERIES",
    "FOOD_PROCESSING",
    "AGRI_CHEMICAL",
    "AGRI_MACHINERY",
    "IRRIGATION",
    // General Industries
    "MANUFACTURING",
    "CONSTRUCTION",
    "MINING",
    "ENERGY",
    "TELECOMMUNICATION",
    "TRANSPORTATION",
    "LOGISTICS",
    "HEALTHCARE",
    "HOSPITALITY",
    "RETAIL",
    "REAL_ESTATE",
    "CONSULTING",
    "LEGAL",
    "MEDIA",
    "ENTERTAINMENT",
    "INFORMATION_TECHNOLOGY",
    "E_COMMERCE",
    "BANKING",
    "INSURANCE",
  ]).optional(),
  employmentLevel: z.enum([
    "INTERN",
    "STAFF",
    "SUPERVISOR",
    "MANAGER",
    "SENIOR_MANAGER",
    "DIRECTOR",
    "VP",
    "C_LEVEL",
    "FOUNDER",
    "OTHER",
  ]).optional(),

  // Sorting options
  sortBy: z.enum(["name", "classYear", "department", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// ===== RESPONSE TYPE DEFINITIONS =====

// Alumni statistics response type (public)
export interface AlumniStatsPublicResponse {
  totalAlumni: number;
  departmentStats: {
    tep: number;
    tpn: number;
    tin: number;
  };
  classYearStats: {
    before2010: number;
    _2010_2015: number;
    _2016_2020: number;
    after2020: number;
  };
  employmentStats: {
    employedAlumni: number;
    alumniByIndustry: Record<string, number>;
    alumniByLevel: Record<string, number>;
  };
  geographicStats: {
    alumniByCity: Record<string, number>;
  };
  averageClassYear: number | null;
  lastUpdated: string;
}

// Alumni statistics response type (dashboard - includes sensitive data)
export interface AlumniStatsDashboardResponse extends AlumniStatsPublicResponse {
  incomeStats: {
    alumniByIncome: Record<string, number>;
  };
}

// Job posting statistics response type (public)
export interface JobStatsPublicResponse {
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  jobTypeStats: Record<string, number>;
  locationStats: Record<string, number>;
  companyStats: Record<string, number>;
  industryStats: Record<string, number>;
  averageSalaryRange: string | null;
  lastUpdated: string;
}

// Job posting statistics response type (dashboard - includes sensitive data)
export interface JobStatsDashboardResponse extends JobStatsPublicResponse {
  salaryStats: {
    salaryRangeDistribution: Record<string, number>;
    averageSalaryMin: number | null;
    averageSalaryMax: number | null;
  };
  applicationStats?: {
    totalApplications: number;
    avgApplicationsPerJob: number;
    applicationRate: number;
  };
  timeStats: {
    avgTimeToFill: number | null; // in days
    jobPostingTrends: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
}

// Business posting statistics response type (public)
export interface BusinessStatsPublicResponse {
  totalBusinesses: number;
  activeBusinesses: number;
  inactiveBusinesses: number;
  categoryStats: Record<string, number>;
  locationStats: Record<string, number>;
  websiteStats: {
    withWebsite: number;
    withoutWebsite: number;
    websiteRate: number;
  };
  lastUpdated: string;
}

// Business posting statistics response type (dashboard - includes sensitive data)
export interface BusinessStatsDashboardResponse extends BusinessStatsPublicResponse {
  contactStats: {
    withContactInfo: number;
    withoutContactInfo: number;
    contactInfoRate: number;
  };
  revenueStats?: {
    totalRevenue?: number;
    avgRevenuePerBusiness?: number;
    revenueDistribution: Record<string, number>;
  };
  growthStats: {
    newBusinessesThisMonth: number;
    newBusinessesLastMonth: number;
    growth: number;
  };
}

// Combined statistics response type (public)
export interface AllStatsPublicResponse {
  alumni: AlumniStatsPublicResponse;
  jobs: JobStatsPublicResponse;
  business: BusinessStatsPublicResponse;
  overview: {
    totalItems: number;
    lastUpdated: string;
  };
}

// Combined statistics response type (dashboard)
export interface AllStatsDashboardResponse {
  alumni: AlumniStatsDashboardResponse;
  jobs: JobStatsDashboardResponse;
  business: BusinessStatsDashboardResponse;
  overview: {
    totalItems: number;
    totalActiveItems: number;
    lastUpdated: string;
    platformHealth: {
      userEngagement: number;
      contentFreshness: number;
      dataCompleteness: number;
    };
  };
}

// Alumni search response type (public)
export interface AlumniSearchPublicResponse {
  alumni: Array<{
    id: string;
    fullName: string;
    department: string;
    classYear: number;
    city?: string;
    industry?: string;
    jobTitle?: string;
    companyName?: string;
    employmentLevel?: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: {
    search?: string;
    department?: string;
    classYearFrom?: number;
    classYearTo?: number;
    city?: string;
    industry?: string;
    employmentLevel?: string;
  };
}

// ===== EXPORTED TYPES =====

// Query types
export type AlumniStatsPublicQuery = z.infer<typeof alumniStatsPublicQuerySchema>;
export type AlumniStatsDashboardQuery = z.infer<typeof alumniStatsDashboardQuerySchema>;
export type JobStatsPublicQuery = z.infer<typeof jobStatsPublicQuerySchema>;
export type JobStatsDashboardQuery = z.infer<typeof jobStatsDashboardQuerySchema>;
export type BusinessStatsPublicQuery = z.infer<typeof businessStatsPublicQuerySchema>;
export type BusinessStatsDashboardQuery = z.infer<typeof businessStatsDashboardQuerySchema>;
export type AllStatsPublicQuery = z.infer<typeof allStatsPublicQuerySchema>;
export type AllStatsDashboardQuery = z.infer<typeof allStatsDashboardQuerySchema>;
export type AlumniSearchPublicQuery = z.infer<typeof alumniSearchPublicSchema>;

// Service refresh options
export interface RefreshOptions {
  refresh?: boolean;
  alumni?: boolean;
  jobs?: boolean;
  business?: boolean;
}