import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(100).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).trim(),
  category: z.string().min(2, 'Category is required').max(50).trim(),
  websiteUrl: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  productUrl: z.string().url('Invalid product purchase URL').or(z.literal('')).optional(),
  usp: z.string().max(500).optional(),
  features: z.array(z.string()).default([]),
  pricingDetails: z.string().max(200).optional(),
  targetAudience: z.string().max(500).optional(),
  brandGuidelines: z.string().max(1000).optional(),
  restrictions: z.string().max(500).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
