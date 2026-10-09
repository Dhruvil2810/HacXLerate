import { z } from 'zod';

export const creditTransactionTypeEnum = z.enum([
  'CREDIT_GRANT',
  'AI_USAGE',
  'CAMPAIGN_REWARD',
  'CAMPAIGN_RESERVATION',
  'CAMPAIGN_RELEASE',
  'CAMPAIGN_REFUND',
  'ADMIN_ADJUSTMENT',
  'REVERSAL',
]);

export const getLedgerQuerySchema = z.object({
  type: creditTransactionTypeEnum.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const adminAdjustCreditsSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  amount: z.coerce.number().int().refine((val) => val !== 0, 'Amount cannot be zero'),
  type: z.enum(['CREDIT_GRANT', 'ADMIN_ADJUSTMENT', 'REVERSAL']).default('ADMIN_ADJUSTMENT'),
  description: z.string().min(5, 'Description is required').max(200).trim(),
  reason: z.string().min(5, 'Reason for audit trail is required').max(500).trim(),
});

export type GetLedgerQueryInput = z.infer<typeof getLedgerQuerySchema>;
export type AdminAdjustCreditsInput = z.infer<typeof adminAdjustCreditsSchema>;
