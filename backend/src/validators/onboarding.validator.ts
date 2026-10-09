import { z } from 'zod';

export const brandOnboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100).trim(),
  industry: z.string().max(100).optional(),
  websiteUrl: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
});

export const creatorOnboardingSchema = z.object({
  handle: z
    .string()
    .min(2, 'Handle must be at least 2 characters')
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores')
    .trim(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(100).optional(),
  categories: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  contentTypes: z.array(z.string()).default([]),
});

export type BrandOnboardingInput = z.infer<typeof brandOnboardingSchema>;
export type CreatorOnboardingInput = z.infer<typeof creatorOnboardingSchema>;
