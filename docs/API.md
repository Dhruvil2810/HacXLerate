# CreatorOS — API Design & Contract Specification

## 1. Overview & Conventions
- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Authentication:** Bearer JWT in `Authorization` header and/or secure HTTP-Only cookie.
- **Consistent Response Format:**
```json
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-10-09T00:00:00.000Z" }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Campaign with ID '...' does not exist.",
    "details": null
  }
}
```

---

## 2. API Endpoint Matrix

### 2.1 Health & System
- `GET /health` — Returns system status, DB connectivity, memory, and timestamp.
- `GET /api/v1/health` — API v1 heartbeat endpoint.

### 2.2 Authentication & Identity (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register user with email, password, and primary role.
- `POST /api/v1/auth/login` — Authenticate user and issue tokens.
- `POST /api/v1/auth/logout` — Revoke session / clear auth cookies.
- `GET  /api/v1/auth/me` — Retrieve current authenticated profile & available roles.
- `POST /api/v1/auth/switch-role` — Active role toggle (`BRAND` / `CREATOR`).
- `GET  /api/v1/auth/google` — Initiate Google OAuth login/registration.
- `GET  /api/v1/auth/google/callback` — Google OAuth callback handler.

### 2.3 Creators & Profiles (`/api/v1/creators`)
- `GET  /api/v1/creators` — Search & filter creators (categories, verification, views).
- `GET  /api/v1/creators/:id` — Full public profile, portfolios, stats, and verified metrics.
- `PUT  /api/v1/creators/profile` — Update authenticated creator profile.
- `POST /api/v1/creators/portfolio` — Add portfolio item.
- `DELETE /api/v1/creators/portfolio/:id` — Delete portfolio item.
- `POST /api/v1/creators/analytics/upload` — Upload CSV / report document (marked `UPLOADED`).
- `POST /api/v1/creators/analytics/manual` — Manually input stats (marked `SELF_REPORTED`).

### 2.4 Brands & Products (`/api/v1/brands`, `/api/v1/products`)
- `GET  /api/v1/brands/profile` — Fetch brand profile.
- `PUT  /api/v1/brands/profile` — Update brand profile.
- `GET  /api/v1/products` — List brand products.
- `POST /api/v1/products` — Create product profile.
- `GET  /api/v1/products/:id` — Product detail with AI extraction metadata.
- `POST /api/v1/products/:id/ai-analyze` — Trigger AI product understanding & brief generation.

### 2.5 Campaigns & Applications (`/api/v1/campaigns`)
- `GET  /api/v1/campaigns` — List campaigns (with filters for status, reward model, category).
- `POST /api/v1/campaigns` — Create campaign & reserve credit budget.
- `GET  /api/v1/campaigns/:id` — Retrieve campaign details.
- `PUT  /api/v1/campaigns/:id` — Update campaign brief / requirements.
- `POST /api/v1/campaigns/:id/ai-assist` — AI assistance for brief, hooks, and guidelines.
- `POST /api/v1/campaigns/:id/apply` — Creator application submission.
- `GET  /api/v1/campaigns/:id/applications` — Brand view of applicants with match ranking.
- `POST /api/v1/campaigns/:id/applications/:appId/decision` — Accept or reject applicant.

### 2.6 Content Lifecycle & Performance (`/api/v1/content`)
- `POST /api/v1/content/submissions` — Creator submits draft for review.
- `POST /api/v1/content/submissions/:id/review` — Brand approves or requests revision.
- `POST /api/v1/content/publish` — Creator links published YouTube video URL.
- `GET  /api/v1/content/tracking/:campaignId` — Live performance dashboard for campaign content.

### 2.7 YouTube Social Connector (`/api/v1/social/youtube`)
- `GET  /api/v1/social/youtube/connect` — Generate Google OAuth consent URL for YouTube scopes.
- `GET  /api/v1/social/youtube/callback` — Exchange auth code, store tokens, and schedule sync.
- `POST /api/v1/social/youtube/sync` — Trigger immediate channel & video refresh.
- `DELETE /api/v1/social/youtube/disconnect` — Disconnect channel and revoke tokens.

### 2.8 Messaging (`/api/v1/messages`)
- `GET  /api/v1/messages/conversations` — List user conversations.
- `GET  /api/v1/messages/conversations/:id` — Retrieve conversation thread.
- `POST /api/v1/messages/conversations/:id` — Send message.

### 2.9 Credits & Ledger (`/api/v1/credits`)
- `GET  /api/v1/credits/balance` — Current balance, reserved credits, and lifetime stats.
- `GET  /api/v1/credits/ledger` — Paginated immutable ledger transactions.

### 2.10 Admin Operations (`/api/v1/admin`)
- `GET  /api/v1/admin/users` — User management & status inspection.
- `POST /api/v1/admin/credits/adjust` — Controlled administrative credit balance adjustment.
- `GET  /api/v1/admin/audit-logs` — System-wide audit log trail.
- `GET  /api/v1/admin/ai-usage` — AI usage and token metrics inspection.
