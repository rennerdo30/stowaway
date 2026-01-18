import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Item schemas
export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  barcode: z.string().optional(),
  buyPrice: z.number().min(0, "Price must be positive"),
  buyDate: z.string().optional(),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  minQuantity: z.number().int().min(0, "Minimum quantity must be non-negative"),
  categoryId: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
});

export const itemUpdateSchema = itemSchema.partial();

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").default("#6366f1"),
});

export const categoryUpdateSchema = categorySchema.partial();

// Location schemas
export const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const locationUpdateSchema = locationSchema.partial();

// Export/Import schemas
export const exportSchema = z.object({
  format: z.enum(["json", "csv"]),
  includeImages: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
