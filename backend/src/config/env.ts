import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file or parent directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().default('http://localhost:5000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().default('postgresql://creatoros_user:creatoros_secure_password@localhost:5432/creatoros_db?schema=public'),

  // Security
  JWT_SECRET: z.string().default('dev_jwt_secret_must_be_configured_in_production_key_32chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('dev_refresh_jwt_secret_must_be_configured_in_production_key'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),

  // OAuth Google & YouTube
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/google/callback'),
  YOUTUBE_CLIENT_ID: z.string().optional().default(''),
  YOUTUBE_CLIENT_SECRET: z.string().optional().default(''),
  YOUTUBE_REDIRECT_URI: z.string().default('http://localhost:5000/api/v1/social/youtube/callback'),
  YOUTUBE_API_KEY: z.string().optional().default(''),

  // OpenRouter AI
  OPENROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_MODEL: z.string().default('openrouter/free'),
  OPENROUTER_SITE_URL: z.string().default('http://localhost:3000'),
  OPENROUTER_SITE_NAME: z.string().default('CreatorOS'),
  AI_DEFAULT_CREDIT_COST: z.coerce.number().default(10),

  // Credit system defaults
  DEFAULT_STARTING_CREDITS_BRAND: z.coerce.number().default(5000),
  DEFAULT_STARTING_CREDITS_CREATOR: z.coerce.number().default(500),

  // Matching Weights
  MATCH_AUDIENCE_WEIGHT: z.coerce.number().default(0.30),
  MATCH_CONTENT_WEIGHT: z.coerce.number().default(0.25),
  MATCH_PERFORMANCE_WEIGHT: z.coerce.number().default(0.20),
  MATCH_ENGAGEMENT_WEIGHT: z.coerce.number().default(0.10),
  MATCH_HISTORY_WEIGHT: z.coerce.number().default(0.10),
  MATCH_BUDGET_WEIGHT: z.coerce.number().default(0.05),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
