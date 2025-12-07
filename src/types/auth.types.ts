import { z } from "zod";

// Department enum matching the Prisma schema
const DepartmentEnum = z.enum(["TEP", "TPN", "TIN"], {
  message: "Jurusan harus salah satu dari: TEP, TPN, atau TIN",
});

// Schema for user registration with email and password
export const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, huruf kecil, dan angka"
    ),
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  department: DepartmentEnum,
  classYear: z
    .number()
    .int("Tahun angkatan harus berupa angka bulat")
    .min(1983, "Tahun angkatan tidak valid")
    .max(
      new Date().getFullYear(),
      "Tahun angkatan tidak boleh melebihi tahun ini"
    ),
});

// Schema for user login with email and password
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const googleAuthSchema = z.object({
  token: z.string().min(1, "Google token wajib diisi"),
});

// Schema for Google user registration (no password required)
export const googleRegisterSchema = z.object({
  token: z.string().min(1, "Google token wajib diisi"),
  department: DepartmentEnum,
  classYear: z
    .number()
    .int("Tahun angkatan harus berupa angka bulat")
    .min(1983, "Tahun angkatan tidak valid")
    .max(
      new Date().getFullYear(),
      "Tahun angkatan tidak boleh melebihi tahun ini"
    ),
});

// Schema for completing alumni profile after Google login
export const completeProfileSchema = z.object({
  department: DepartmentEnum,
  classYear: z
    .number()
    .int("Tahun angkatan harus berupa angka bulat")
    .min(1983, "Tahun angkatan tidak valid")
    .max(
      new Date().getFullYear(),
      "Tahun angkatan tidak boleh melebihi tahun ini"
    ),
  city: z.string().optional(),
  industry: z.enum([
    "AGRICULTURE", "FOOD_TECH", "BIOTECH", "RESEARCH", "EDUCATION",
    "ENGINEERING", "BUSINESS", "MARKETING", "FINANCE", "GOVERNMENT",
    "FREELANCE", "OTHER"
  ]).optional(),
  employmentLevel: z.enum([
    "INTERN", "STAFF", "SUPERVISOR", "MANAGER", "SENIOR_MANAGER",
    "DIRECTOR", "VP", "C_LEVEL", "FOUNDER", "OTHER"
  ]).optional(),
  incomeRange: z.enum([
    "BELOW_5M", "RANGE_5_10M", "RANGE_10_20M", "ABOVE_20M", "UNKNOWN"
  ]).optional(),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  linkedInUrl: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Format URL tidak valid" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type GoogleRegisterInput = z.infer<typeof googleRegisterSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
