import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100).trim(),
  role: z.enum(['BRAND', 'CREATOR', 'ADMIN']).default('BRAND'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const switchRoleSchema = z.object({
  role: z.enum(['BRAND', 'CREATOR', 'ADMIN']),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required'),
  role: z.enum(['BRAND', 'CREATOR']).optional().default('BRAND'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type SwitchRoleInput = z.infer<typeof switchRoleSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
