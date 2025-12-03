import { z } from "zod";

// Department enum matching the Prisma schema
const DepartmentEnum = z.enum(["TEP", "TPN", "TIN"], {
  errorMap: (issue, ctx) => ({ message: "Jurusan harus salah satu dari: TEP, TPN, atau TIN" }),
});

export const registerSchema = z.object({
  email: z.email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
  department: DepartmentEnum,
  classYear: z
    .number()
    .int("Tahun angkatan harus berupa angka bulat")
    .min(1960, "Tahun angkatan tidak valid")
    .max(new Date().getFullYear(), "Tahun angkatan tidak boleh melebihi tahun ini"),
});

export const loginSchema = z.object({
  email: z.email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
});

export const googleAuthSchema = z.object({
  token: z.string().min(1, "Google token wajib diisi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
