import { z } from 'zod';

export const submitContentSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  publishedUrl: z.string().url('A valid published video URL is required'),
  platform: z.enum(['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN']).default('YOUTUBE'),
  initialViews: z.number().int().min(0).optional(),
});

export const reviewContentSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUIRED', 'PUBLISHED']),
  brandFeedback: z.string().optional(),
});

export const evaluateContentSchema = z.object({
  simulatedViews: z.number().int().min(0).optional(),
});

export type SubmitContentInput = z.infer<typeof submitContentSchema>;
export type ReviewContentInput = z.infer<typeof reviewContentSchema>;
export type EvaluateContentInput = z.infer<typeof evaluateContentSchema>;
