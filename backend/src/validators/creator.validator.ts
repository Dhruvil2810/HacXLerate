import { z } from 'zod';

export const addPortfolioItemSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100).trim(),
  description: z.string().max(1000).optional(),
  mediaUrl: z.string().url('Valid media URL is required').or(z.string().min(1)),
  thumbnailUrl: z.string().url().or(z.literal('')).optional(),
  category: z.string().max(50).optional(),
  toolsUsed: z.array(z.string()).default([]),
  metricsSummary: z.record(z.any()).optional(),
});

export const searchCreatorsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  isVerified: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type AddPortfolioItemInput = z.infer<typeof addPortfolioItemSchema>;
export type SearchCreatorsInput = z.infer<typeof searchCreatorsSchema>;
