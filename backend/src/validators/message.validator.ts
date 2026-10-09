import { z } from 'zod';

export const createConversationSchema = z.object({
  recipientUserId: z.string().min(1, 'Recipient user ID is required'),
  campaignId: z.string().optional(),
  initialMessage: z.string().min(1, 'Initial message is required').max(2000).trim(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(2000).trim(),
  attachments: z.array(z.record(z.any())).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
