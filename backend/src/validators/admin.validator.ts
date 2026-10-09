import { z } from 'zod';

export const getAdminUsersQuerySchema = z.object({
  query: z.string().optional(),
  role: z.enum(['BRAND', 'CREATOR', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
  reason: z.string().min(5, 'Reason for status update is required').max(500).trim(),
});

export const getAuditLogsQuerySchema = z.object({
  action: z.string().optional(),
  actorId: z.string().optional(),
  entityType: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(30),
});

export type GetAdminUsersQueryInput = z.infer<typeof getAdminUsersQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type GetAuditLogsQueryInput = z.infer<typeof getAuditLogsQuerySchema>;
