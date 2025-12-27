import { z } from "zod";

// ============================================
// CREATE USER SCHEMA (Admin only)
// ============================================
export const createUserSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email wajib diisi"),
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  npm: z
    .string()
    .regex(/^\d{1,13}$/, "NPM hanya boleh berisi angka maksimal 13 digit"),
  department: z.enum(["TEP", "TPN", "TIN"], {
    message: "Department harus salah satu dari: TEP, TPN, TIN",
  }),
  classYear: z
    .number()
    .int("Tahun angkatan harus berupa angka bulat")
    .min(1960, "Tahun angkatan tidak valid")
    .max(
      new Date().getFullYear(),
      "Tahun angkatan tidak boleh melebihi tahun ini"
    ),
  fullName: z.string().optional(),
});

// ============================================
// USER LIST QUERY PARAMETERS (with search and filter)
// ============================================
export const userListQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page harus berupa angka")
    .default("1")
    .transform(Number),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit harus berupa angka")
    .default("10")
    .transform(Number),
  // Search by name, email, or fullName
  search: z.string().max(100, "Search query maksimal 100 karakter").optional(),
  // Filter by department
  department: z.enum(["TEP", "TPN", "TIN"]).optional(),
  // Filter by class year
  classYear: z
    .string()
    .regex(/^\d+$/, "Class year harus berupa angka")
    .transform(Number)
    .optional(),
  // Filter by location (ID only)
  cityId: z
    .string()
    .regex(/^\d+$/, "City ID harus berupa angka")
    .transform(Number)
    .optional(),
  provinceId: z
    .string()
    .regex(/^\d+$/, "Province ID harus berupa angka")
    .transform(Number)
    .optional(),
  countryId: z
    .string()
    .regex(/^\d+$/, "Country ID harus berupa angka")
    .transform(Number)
    .optional(),
  // Filter by industry
  industry: z
    .enum([
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
      "FREELANCE",
      "OTHER",
    ])
    .optional(),
  // Filter by job level
  jobLevel: z
    .enum([
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
    ])
    .optional(),
  // Filter by status
  status: z
    .enum(["WORKING", "STUDYING", "WORKING_STUDYING", "ENTREPRENEUR", "NOT_WORKING"])
    .optional(),
});

// ============================================
// UPDATE PROFILE SCHEMA (Authenticated users)
// ============================================
export const updateProfileSchema = z.object({
  profile: z
    .object({
      fullName: z
        .string()
        .min(1, "Nama lengkap wajib diisi")
        .max(100, "Nama lengkap maksimal 100 karakter")
        .optional(),
      cityId: z.number().int().optional(),
      cityName: z.string().max(100, "Kota maksimal 100 karakter").optional(),
      provinceId: z.number().int().optional(),
      provinceName: z
        .string()
        .max(100, "Provinsi maksimal 100 karakter")
        .optional(),
      countryId: z.number().int().optional(),
      countryName: z.string().max(100, "Negara maksimal 100 karakter").optional(),
      industry: z
        .enum([
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
          "FREELANCE",
          "OTHER",
        ])
        .optional(),
      jobLevel: z
        .enum([
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
        ])
        .optional(),
      incomeRange: z
        .enum([
          "BELOW_5M",
          "RANGE_5_10M",
          "RANGE_10_20M",
          "ABOVE_20M",
          "UNKNOWN",
        ])
        .optional(),
      jobTitle: z
        .string()
        .max(100, "Job title maksimal 100 karakter")
        .optional(),
      companyName: z
        .string()
        .max(100, "Nama perusahaan maksimal 100 karakter")
        .optional(),
      linkedInUrl: z
        .string()
        .url("Format URL LinkedIn tidak valid")
        .optional(),
      graduationYear: z
        .number()
        .int("Tahun wisuda harus berupa angka bulat")
        .min(1960, "Tahun wisuda tidak valid")
        .max(
          new Date().getFullYear() + 5,
          "Tahun wisuda tidak valid"
        )
        .optional(),
      highestEducation: z
        .enum(["MASTER", "DOCTOR"], {
          message: "Pendidikan lanjutan harus salah satu dari: MASTER, DOCTOR",
        })
        .nullable()
        .optional(),
      status: z
        .enum(["WORKING", "STUDYING", "WORKING_STUDYING", "ENTREPRENEUR", "NOT_WORKING"], {
          message: "Status harus salah satu dari: WORKING, STUDYING, WORKING_STUDYING, ENTREPRENEUR, NOT_WORKING",
        })
        .nullable()
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Minimal satu field profile harus diisi",
    }),
});

// ============================================
// INPUT TYPES
// ============================================
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
