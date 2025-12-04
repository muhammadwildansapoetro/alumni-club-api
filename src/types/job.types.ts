import { z } from "zod";

// Create job posting schema
export const createJobPostingSchema = z.object({
  title: z
    .string()
    .min(1, "Judul lowongan wajib diisi")
    .max(200, "Judul lowongan maksimal 200 karakter"),
  description: z
    .string()
    .min(1, "Deskripsi lowongan wajib diisi")
    .min(20, "Deskripsi minimal 20 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
  company: z
    .string()
    .max(100, "Nama perusahaan maksimal 100 karakter")
    .optional(),
  location: z
    .string()
    .max(100, "Lokasi maksimal 100 karakter")
    .optional(),
  jobType: z
    .enum(["remote", "hybrid", "onsite", "full-time", "part-time", "contract", "internship"], {
      message: "Tipe pekerjaan tidak valid",
    })
    .optional(),
  salaryRange: z
    .string()
    .max(50, "Rentang gaji maksimal 50 karakter")
    .optional(),
  externalUrl: z
    .string()
    .url("Format URL tidak valid")
    .optional()
    .or(z.literal("")),
});

// Update job posting schema
export const updateJobPostingSchema = z.object({
  title: z
    .string()
    .min(1, "Judul lowongan wajib diisi")
    .max(200, "Judul lowongan maksimal 200 karakter")
    .optional(),
  description: z
    .string()
    .min(1, "Deskripsi lowongan wajib diisi")
    .min(20, "Deskripsi minimal 20 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter")
    .optional(),
  company: z
    .string()
    .max(100, "Nama perusahaan maksimal 100 karakter")
    .optional(),
  location: z
    .string()
    .max(100, "Lokasi maksimal 100 karakter")
    .optional(),
  jobType: z
    .enum(["remote", "hybrid", "onsite", "full-time", "part-time", "contract", "internship"], {
      message: "Tipe pekerjaan tidak valid",
    })
    .optional(),
  salaryRange: z
    .string()
    .max(50, "Rentang gaji maksimal 50 karakter")
    .optional(),
  externalUrl: z
    .string()
    .url("Format URL tidak valid")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

// Query parameters for job listings
export const jobQuerySchema = z.object({
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
  search: z.string().max(100, "Search query maksimal 100 karakter").optional(),
  location: z.string().max(100, "Lokasi maksimal 100 karakter").optional(),
  jobType: z.enum(["remote", "hybrid", "onsite", "full-time", "part-time", "contract", "internship"]).optional(),
  company: z.string().max(100, "Perusahaan maksimal 100 karakter").optional(),
  isActive: z
    .string()
    .regex(/^(true|false)$/, "IsActive harus true atau false")
    .optional()
    .transform((val) => val === "true"),
});

// Response types
export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;