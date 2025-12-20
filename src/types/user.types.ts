import { z } from "zod";

// Create user schema (admin only)
export const createUserSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email wajib diisi"),
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
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

// Update user profile schema
export const updateUserProfileSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email wajib diisi")
    .optional(),
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter")
    .optional(),
  profile: z
    .object({
      fullName: z
        .string()
        .min(1, "Nama lengkap wajib diisi")
        .max(100, "Nama lengkap maksimal 100 karakter")
        .optional(),
      city: z.string().max(100, "Kota maksimal 100 karakter").optional(),
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
      employmentLevel: z
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
      linkedInUrl: z.string().url("Format URL LinkedIn tidak valid").optional(),
    })
    .optional(),
});

// Update password schema
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

// Update password schema (admin version - current password optional)
export const updatePasswordAdminSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

// Update user role schema (admin only)
export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"], {
    message: "Role harus USER atau ADMIN",
  }),
});

// Query parameters for pagination
export const paginationSchema = z.object({
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
});

// Query parameters for alumni directory
export const alumniDirectoryQuerySchema = paginationSchema.extend({
  department: z.enum(["TEP", "TPN", "TIN"]).optional(),
  classYear: z
    .string()
    .regex(/^\d+$/, "Class year harus berupa angka")
    .transform(Number)
    .optional(),
  city: z.string().optional(),
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
  search: z.string().max(100, "Search query maksimal 100 karakter").optional(),
});

// CSV import template
export const csvImportTemplate = {
  requiredFields: ["email", "name", "department", "classYear"],
  optionalFields: ["fullName", "password", "role"],
  example: {
    email: "john@example.com",
    name: "John Doe",
    department: "TEP",
    classYear: "2020",
    fullName: "John Doe",
    password: "password123",
    role: "USER",
  },
  departments: ["TEP", "TPN", "TIN"],
  roles: ["USER", "ADMIN"],
};

// Response types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdatePasswordAdminInput = z.infer<
  typeof updatePasswordAdminSchema
>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type AlumniDirectoryQuery = z.infer<typeof alumniDirectoryQuerySchema>;
