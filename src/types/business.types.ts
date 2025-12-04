import { z } from "zod";

// Create business listing schema
export const createBusinessListingSchema = z.object({
  businessName: z
    .string()
    .min(1, "Nama bisnis wajib diisi")
    .max(100, "Nama bisnis maksimal 100 karakter"),
  description: z
    .string()
    .min(1, "Deskripsi bisnis wajib diisi")
    .min(20, "Deskripsi minimal 20 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
  category: z
    .string()
    .max(50, "Kategori maksimal 50 karakter")
    .optional(),
  location: z
    .string()
    .max(100, "Lokasi maksimal 100 karakter")
    .optional(),
  website: z
    .string()
    .url("Format website tidak valid")
    .optional()
    .or(z.literal("")),
  contactInfo: z
    .string()
    .max(500, "Informasi kontak maksimal 500 karakter")
    .optional(),
});

// Update business listing schema
export const updateBusinessListingSchema = z.object({
  businessName: z
    .string()
    .min(1, "Nama bisnis wajib diisi")
    .max(100, "Nama bisnis maksimal 100 karakter")
    .optional(),
  description: z
    .string()
    .min(1, "Deskripsi bisnis wajib diisi")
    .min(20, "Deskripsi minimal 20 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter")
    .optional(),
  category: z
    .string()
    .max(50, "Kategori maksimal 50 karakter")
    .optional(),
  location: z
    .string()
    .max(100, "Lokasi maksimal 100 karakter")
    .optional(),
  website: z
    .string()
    .url("Format website tidak valid")
    .optional()
    .or(z.literal("")),
  contactInfo: z
    .string()
    .max(500, "Informasi kontak maksimal 500 karakter")
    .optional(),
  isActive: z.boolean().optional(),
});

// Query parameters for business listings
export const businessQuerySchema = z.object({
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
  category: z.string().max(50, "Kategori maksimal 50 karakter").optional(),
  location: z.string().max(100, "Lokasi maksimal 100 karakter").optional(),
  isActive: z
    .string()
    .regex(/^(true|false)$/, "IsActive harus true atau false")
    .optional()
    .transform((val) => val === "true"),
});

// Response types
export type CreateBusinessListingInput = z.infer<typeof createBusinessListingSchema>;
export type UpdateBusinessListingInput = z.infer<typeof updateBusinessListingSchema>;
export type BusinessQueryInput = z.infer<typeof businessQuerySchema>;