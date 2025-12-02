import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
});

export const loginSchema = z.object({
  email: z.email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
