# CreatorOS — Project Overview & Vision

## 1. Product Vision
**CreatorOS** is an AI-assisted, data-driven creator performance marketplace connecting brands and content creators. It bridges the gap between creator discovery, verified multi-platform analytics, campaign lifecycle management, and performance-based reward distribution.

Unlike traditional influencer agencies or basic marketplace directories, CreatorOS is built on a **deterministic measurement engine** coupled with an **AI semantic reasoning layer**. AI handles semantic matching, product understanding, campaign brief generation, and insights, while deterministic backend services compute rankings, statistical consistency, analytics deltas, CPM calculations, and internal reward ledgers.

---

## 2. Problem Statement
1. **Vanity Metrics vs. Real Performance:** Brands struggle to verify creator reach and engagement authenticity; creators with erratic or inflated view counts cost campaigns without delivering measurable ROI.
2. **Manual and Inefficient Campaign Workflows:** Negotiating, briefing, reviewing content drafts, and tracking published links across channels is fragmented and manual.
3. **Lack of Transparent Performance Incentives:** Creators lack reliable, performance-tied reward structures, and brands lack low-risk, verified-view payout models (e.g., CPM / CPE).
4. **Disjointed Intelligence:** Matching algorithms are often black-box or purely keyword-based, failing to evaluate content tone, audience demographic overlap, and historical delivery consistency.

---

## 3. Marketplace Flow & Core Personas

### Personas & Roles
- **Brand:** Creates products, launches campaigns, sets CPM reward budgets, leverages AI for briefs, discovers and compares creators, reviews drafts, tracks live campaign analytics, and distributes performance credits.
- **Creator:** Connects social channels (Phase 1: YouTube OAuth), imports verified historical and incremental video analytics (or uploads verifiable reports), discovers matching campaigns, submits drafts, links published URLs, and earns performance-based platform credits.
- **Admin:** System monitoring, user moderation, dispute resolution, credit ledger oversight, manual audit-logged adjustments, AI token/cost inspection, and sync job observability.
- **Multi-Role Capability:** Accounts are structured with many-to-many role mappings (`UserRole`), allowing a single user account to operate seamlessly as both Brand and Creator.

### End-to-End Marketplace Flow
```
[Brand]                          [CreatorOS Platform]                      [Creator]
   │                                      │                                    │
   ├─ 1. Register / Onboard ─────────────►│◄────────── 1. Register / Onboard ──┤
   ├─ 2. Add Product + AI Analysis ──────►│                                    │
   ├─ 3. Create Campaign (CPM Model) ────►│◄── 2. Connect YouTube (OAuth) ────┤
   │                                      │    (Imports Channel + Videos)      │
   ├─ 4. Discover Creators / AI Match ───►│◄── 3. Browse Matching Campaigns ──┤
   ├─ 5. Invite Creator / Accept App ────►│◄── 4. Apply to Campaign ──────────┤
   │                                      │                                    │
   │  [ In-App Messaging & Collaboration ]│                                    │
   │◄─────────────────────────────────────┴───────────────────────────────────►│
   │                                      │                                    │
   │                                      │◄── 5. Submit Draft Content ────────┤
   ├─ 6. Review & Approve Draft ─────────►│                                    │
   │                                      │◄── 6. Publish & Submit Video URL ──┤
   │                                      │                                    │
   │                                [ Periodic Sync Engine ]                   │
   │                                - Fetch Video Snapshots                    │
   │                                - Compute Incremental Views                │
   │                                - Calculate CPM Reward Ledger              │
   │                                      │                                    │
   ├─ 7. View Live Campaign ROI ──────────┤                                    │
   │    (Views, CPE, Spend, Leaderboard)  ├──── 7. View Earned Credit Balance ─┤
```

---

## 4. Phase-Wise Roadmap

| Phase | Title | Scope Summary | Status |
|---|---|---|---|
| **Phase 0** | **Project Foundation** | Monorepo scaffolding, Express + TypeScript backend, React + Vite frontend, PostgreSQL + Prisma schema, Zod validation, base logging, Docker & environment configuration, comprehensive documentation. | **CURRENT** |
| **Phase 1** | **Authentication & User System** | Email/password auth, Google OAuth, JWT with secure cookies, multi-role management (Brand, Creator, Admin), profile setup, onboarding flows. | *Pending* |
| **Phase 2** | **Database & Core Marketplace** | Products, campaigns, creator profiles, portfolios, applications, invitations, direct messaging system, notification pipeline. | *Pending* |
| **Phase 3** | **Credit System & Audit Ledger** | Immutable double-entry-style credit ledger, wallet management, AI token credit deductions, reward reservations/releases, system audit log. | *Pending* |
| **Phase 4** | **AI Foundation & OpenRouter** | Abstracted `AIService` / `AIProvider`, OpenRouter free router integration (`openrouter/free`), product analysis, campaign generation, deterministic matching with AI reasoning. | *Pending* |
| **Phase 5** | **YouTube Integration** | Google Cloud OAuth 2.0 flow for YouTube, Data API v3 & Analytics API integration, historical/incremental snapshots, verification tiers (VERIFIED, UPLOADED, SELF_REPORTED). | *Pending* |
| **Phase 6** | **Performance & Reward Engine** | Published URL submission, YouTube video verification, incremental views calculation, CPM performance calculation, leaderboard, automated credit distribution. | *Pending* |
| **Phase 7** | **Professional UI & Showcase** | High-density light-mode B2B SaaS interface, marketing landing page, interactive demo data, responsive layouts, data tables, analytics charts. | *Pending* |
| **Phase 8** | **Testing & Production Polish** | Unit/integration test suites, security validation, production Docker builds, rate-limit stress tests, deployment guides. | *Pending* |

---

## 5. Technology Stack Summary
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL (with pgvector support), Winston, Zod, Helmet, CORS, jsonwebtoken, bcryptjs.
- **Frontend:** React.js, Vite, TypeScript, Lucide React, Custom Light-Mode Design System (Vanilla CSS with strict design tokens).
- **AI Layer:** OpenRouter API (`openrouter/free` router abstraction with fallback-ready multi-model handling).
- **Social Connector:** Google OAuth 2.0 + YouTube Data API v3 + YouTube Analytics API.
- **DevOps:** Docker, Docker Compose, multi-stage Dockerfiles, Environment templates.
