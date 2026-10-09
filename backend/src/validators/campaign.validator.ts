import { z } from 'zod';

export const createCampaignSchema = z.object({
  productId: z.string().optional(),
  title: z.string().min(5, 'Campaign title must be at least 5 characters').max(150).trim(),
  objective: z.string().min(5, 'Objective is required').max(500).trim(),
  description: z.string().min(20, 'Brief description must be at least 20 characters').max(3000).trim(),
  budgetCredits: z.coerce.number().min(100, 'Minimum campaign budget is 100 credits'),
  rewardModel: z.enum(['CPM', 'CPE', 'CLICK', 'CONVERSION', 'HYBRID']).default('CPM'),
  cpmRate: z.coerce.number().min(1, 'Minimum CPM rate is 1 credit per 1k views').default(50.0),
  targetAudience: z.string().max(500).optional(),
  targetLocation: z.string().max(100).optional(),
  targetAgeRange: z.string().max(50).optional(),
  targetGender: z.string().max(50).optional(),
  contentPlatform: z.enum(['YOUTUBE', 'INSTAGRAM', 'TIKTOK']).default('YOUTUBE'),
  contentType: z.string().max(100).optional(),
  creatorCategories: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredTools: z.array(z.string()).default([]),
  contentRequirements: z.string().max(1500).optional(),
  prohibitedContent: z.string().max(1000).optional(),
  ctaUrl: z.string().url().or(z.literal('')).optional(),
  hashtags: z.array(z.string()).default([]),
  startDate: z.string().datetime().or(z.string()).optional(),
  endDate: z.string().datetime().or(z.string()).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'APPLICATIONS_OPEN', 'IN_PROGRESS', 'CONTENT_REVIEW', 'LIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
});

export const applyCampaignSchema = z.object({
  pitch: z.string().min(10, 'Pitch must be at least 10 characters').max(1000).trim(),
  proposedRate: z.coerce.number().optional(),
});

export const reviewApplicationSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});

export const inviteCreatorSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID is required'),
  message: z.string().max(500).optional(),
  offeredCpm: z.coerce.number().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ApplyCampaignInput = z.infer<typeof applyCampaignSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
export type InviteCreatorInput = z.infer<typeof inviteCreatorSchema>;
