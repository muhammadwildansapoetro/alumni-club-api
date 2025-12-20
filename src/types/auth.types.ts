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

// Schema for forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

// Schema for reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token reset password wajib diisi"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, huruf kecil, dan angka"
    ),
});

// Schema for change password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password baru harus mengandung huruf besar, huruf kecil, dan angka"
    ),
});

// Schema for resend verification email
export const resendVerificationSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

// Schema for email verification (token from query params)
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token verifikasi wajib diisi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type GoogleRegisterInput = z.infer<typeof googleRegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
