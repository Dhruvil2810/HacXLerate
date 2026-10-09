# CreatorOS — DevOps & Deployment Specification

## 1. Local Development Setup

### Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose (or local PostgreSQL 16 instance)
- npm >= 10.x

### Running with Docker Compose
```bash
# 1. Start PostgreSQL with pgvector support
docker compose up -d postgres

# 2. Setup backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# 3. Setup frontend
cd ../frontend
npm install
npm run dev
```

---

## 2. Environment Configuration Matrix

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://creatoros:creatoros_pass@localhost:5432/creatoros_db?schema=public` |
| `JWT_SECRET` | Secret key for JWT signing | Strong 64-char random hex |
| `JWT_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_SECRET` | Secret key for Refresh Token | Strong 64-char random hex |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `ENCRYPTION_KEY` | AES-256 key for sensitive tokens | 32-byte hex string |
| `FRONTEND_URL` | Frontend origin URL | `http://localhost:3000` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your-google-client-secret` |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI | `http://localhost:5000/api/v1/auth/google/callback` |
| `YOUTUBE_REDIRECT_URI` | YouTube OAuth redirect URI | `http://localhost:5000/api/v1/social/youtube/callback` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI Model identifier / router | `openrouter/free` |
| `AI_DEFAULT_CREDIT_COST`| Internal credit cost per AI call | `10` |

---

## 3. Production Architecture Recommendations

### Recommended Standard Cloud Blueprint:
1. **Frontend:** Cloudflare Pages, Vercel, or AWS S3 + CloudFront (SPA build output).
2. **Backend API:** Managed container service (AWS ECS Fargate, Render, Railway, or Google Cloud Run).
3. **Database:** Managed PostgreSQL (AWS RDS, Supabase, or Neon) with automated daily backups.
4. **Scheduled Sync / Workers:** Node.js cron worker process or CloudWatch / Celery schedule.
5. **Observability:** Structured JSON logs via Winston to Datadog / Grafana Loki / CloudWatch.
