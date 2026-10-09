# CreatorOS — Production Deployment Guide
## Free-Tier Deployment: Render Static Site + Render Web Service + Neon PostgreSQL

This guide provides exact step-by-step instructions to deploy CreatorOS on free-tier cloud infrastructure:
* **Frontend:** [Render Static Sites](https://render.com) (React 18 + Vite SPA)
* **Backend:** [Render Web Services](https://render.com) (Node.js 20 + Express 4 REST API)
* **Database:** [Neon Serverless PostgreSQL](https://neon.tech) (PostgreSQL 16 + pgvector)

---

## Architecture Overview

```mermaid
graph LR
    Browser["User Browser"]
    Frontend["Render Static Site<br/>(React / Vite)<br/>https://creatoros-web.onrender.com"]
    Backend["Render Web Service<br/>(Node.js / Express)<br/>https://creatoros-api.onrender.com"]
    Neon[("Neon PostgreSQL 16<br/>sslmode=require + pgvector")]
    OpenRouter["OpenRouter AI<br/>(openrouter/free)"]
    YouTube["Google / YouTube API"]

    Browser -->|Static HTML/JS| Frontend
    Browser -->|API Requests & Bearer Token| Backend
    Backend -->|Prisma Client (TLS/SSL)| Neon
    Backend -->|LLM Inferencing| OpenRouter
    Backend -->|Channel & Video Telemetry| YouTube
```

---

## Step 1: Provision Neon PostgreSQL Database

1. Create a free account at [neon.tech](https://neon.tech).
2. Click **Create Project**:
   * **Project Name:** `creatoros-db`
   * **Postgres Version:** `16`
   * **Region:** Choose the region closest to your Render service (e.g., `US East (Ohio)` or `Frankfurt`).
3. Once created, navigate to **Dashboard** -> **Connection Details**:
   * Choose **Prisma** or **PostgreSQL** connection string.
   * Ensure it contains `?sslmode=require`.
   * Example connection string:
     ```text
     postgresql://neondb_owner:YOUR_PASSWORD@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
4. *(Optional — Vector Extension)* In the Neon **SQL Editor**, execute:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

---

## Step 2: Deploy Backend Web Service on Render

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `Dhruvil2810/HacXLerate`.
4. Configure service parameters:

| Setting | Value |
|---|---|
| **Name** | `creatoros-api` (or your preferred name) |
| **Region** | Same region as Neon (e.g., `Ohio (US East)`) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run prisma:deploy && npm start` |
| **Instance Type** | `Free` |

> [!NOTE]
> The build command `npm run build` executes `prisma generate && tsc`, ensuring Prisma Client is compiled before TypeScript compiles. The start command runs `prisma migrate deploy` to automatically apply all committed migrations to Neon before launching Express on `0.0.0.0:${PORT}`.

5. Click **Advanced** -> **Health Check Path**:
   * Set to: `/health`

6. In **Environment Variables**, add the following keys:

| Environment Variable | Recommended Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security & logging |
| `PORT` | `10000` | Render injects this automatically |
| `DATABASE_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Your Neon connection string with SSL |
| `FRONTEND_URL` | `https://creatoros-web.onrender.com` | Your Render Static Site URL (from Step 3) |
| `BACKEND_URL` | `https://creatoros-api.onrender.com` | Your Render Web Service URL |
| `CORS_ORIGIN` | `https://creatoros-web.onrender.com` | Allowed browser origins (comma-separated) |
| `JWT_SECRET` | *(Random 32+ char string)* | Used for access token signing |
| `JWT_EXPIRES_IN` | `15m` | Token lifetime |
| `JWT_REFRESH_SECRET` | *(Random 32+ char string)* | Used for refresh token signing |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `ENCRYPTION_KEY` | *(Random 64 hex chars)* | AES-256-GCM encryption key (32 bytes) |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your OpenRouter API Key |
| `OPENROUTER_MODEL` | `google/gemma-2-9b-it:free` | Free model fallback |
| `OPENROUTER_SITE_URL` | `https://creatoros-web.onrender.com` | Required header for OpenRouter |
| `OPENROUTER_SITE_NAME` | `CreatorOS` | Display name for OpenRouter |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Optional (for Google OAuth) |
| `GOOGLE_CLIENT_SECRET` | `...` | Optional (for Google OAuth) |
| `GOOGLE_CALLBACK_URL` | `https://creatoros-api.onrender.com/api/v1/auth/google/callback` | Callback URL |
| `YOUTUBE_CLIENT_ID` | `...apps.googleusercontent.com` | Optional (for YouTube OAuth) |
| `YOUTUBE_CLIENT_SECRET` | `...` | Optional (for YouTube OAuth) |
| `YOUTUBE_REDIRECT_URI` | `https://creatoros-api.onrender.com/api/v1/social/youtube/callback` | YouTube redirect URI |
| `YOUTUBE_API_KEY` | `...` | Optional (for direct channel/video queries) |

7. Click **Create Web Service**. Render will clone, build, run migrations on Neon, and start the service.

---

## Step 3: Deploy Frontend Static Site on Render

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect the same repository: `Dhruvil2810/HacXLerate`.
3. Configure settings:

| Setting | Value |
|---|---|
| **Name** | `creatoros-web` (or your preferred name) |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. In **Environment Variables**, add:

| Environment Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://creatoros-api.onrender.com` | URL of your deployed Render backend |

5. **Single-Page Application (SPA) Routing Rule:**
   * Go to **Redirects/Rewrites** in the Static Site dashboard.
   * Add a rewrite rule:
     * **Source:** `/*`
     * **Destination:** `/index.html`
     * **Action:** `Rewrite`
   * This ensures page refreshes and direct URLs route through React Router without 404 errors.

6. Click **Create Static Site**.

---

## Step 4: Seed Initial Data (Optional Showcase Data)

Once the backend web service is deployed and migrations are applied on Neon, you can seed the database with demo accounts:

1. In Render Dashboard, open `creatoros-api` -> **Shell**.
2. Run:
   ```bash
   npm run prisma:seed
   ```
3. Pre-configured demo accounts will be created:
   * **Brand:** `brand@creatoros.io` / `Password123!` (Apex Audio Labs)
   * **Creator (Tech):** `creator@creatoros.io` / `Password123!` (@alexriveratech)
   * **Creator (Design):** `elena@creatoros.io` / `Password123!` (@elenadesigns)
   * **Creator (Code):** `marcus@creatoros.io` / `Password123!` (@marcuscode)
   * **Admin:** `admin@creatoros.io` / `Password123!`

---

## Step 5: Architecture & Free-Tier Operational Notes

### 1. Storage Architecture
* **File Uploads:** Analytics evidence reports and submissions store metadata and URL references directly in PostgreSQL. There is **no dependency on local disk storage**, ensuring zero data loss when Render containers restart or sleep.
* **Database Persistence:** All accounts, campaigns, escrow balances, and transactions persist securely in Neon PostgreSQL.

### 2. Background Jobs & Free Tier Sleep Behavior
* Render free-tier Web Services spin down after 15 minutes of inactivity and wake up upon incoming HTTP requests (takes ~30–45 seconds for cold start).
* **Stateless Payout Engine:** All performance evaluations ($\Delta \text{Views}$ calculations and escrow releases) are designed as on-demand REST operations. There are no long-running daemon workers required.
* **Cold-Start Resilience:** The `/health` endpoint responds with HTTP 200 without blocking, allowing Render to mark the service healthy immediately during wake-up.

### 3. Secrets Security
* All sensitive credentials (`JWT_SECRET`, `ENCRYPTION_KEY`, `DATABASE_URL`, `OPENROUTER_API_KEY`, `GOOGLE_CLIENT_SECRET`) reside **strictly on the backend**.
* The frontend receives only `VITE_API_URL` at build time.

---

## Step 6: Troubleshooting Runbook

| Symptom | Probable Cause | Resolution |
|---|---|---|
| **CORS Error in Browser** | `FRONTEND_URL` or `CORS_ORIGIN` does not match the frontend domain | Ensure `CORS_ORIGIN` on backend matches the exact Render frontend URL (e.g. `https://creatoros-web.onrender.com`) without a trailing slash. |
| **Prisma Connection Refused** | Missing `?sslmode=require` in `DATABASE_URL` | Neon requires TLS. Append `?sslmode=require` to the connection string. |
| **Frontend 404 on Refresh** | Missing SPA rewrite rule on Render Static Site | Add `/* -> /index.html` (Rewrite) under Static Site **Redirects/Rewrites**. |
| **Render Deploy Timeout** | Cold start or long build | Ensure Build Command is `npm install && npm run build`. |
| **Google/YouTube OAuth Redirect URI Mismatch** | URL in Google Cloud Console doesn't match Render backend | Add `https://creatoros-api.onrender.com/api/v1/social/youtube/callback` to Authorized Redirect URIs in Google Cloud Console. |
