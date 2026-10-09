# CreatorOS — Official Hackathon & Project Submission Package

## 1. Project Title
**CreatorOS** (AI-Native Creator Performance Marketplace)

---

## 2. Executive Summary & Project Description

### Short Pitch (2-liner)
CreatorOS is an AI-native performance marketplace where brands hire verified creators through deterministic statistical match scoring, AI-generated creative briefs, and automated view-verified CPM escrow payouts backed by an immutable ledger.

### Full Project Description
Influencer marketing is plagued by vanity metrics, opaque pricing, and post-campaign disputes: brands pay upfront with no guarantee of viewer retention, while creators struggle to prove authentic incremental reach.

**CreatorOS** transforms influencer collaborations into an automated, verifiable performance engine:
1. **AI-Assisted Brief & Product Intelligence:** Brands define products and USPs; an integrated multi-model LLM router (Google Gemma / Mistral / Llama via OpenRouter) analyzes target demographics, extracts compliance guidelines, generates hooks, and drafts conversion-focused campaign briefs.
2. **Deterministic Match & Statistical Scoring:** Creator vetting goes beyond follower counts. An objective statistical engine computes coefficient-of-variation view consistency scores, audience demographic alignment, and category affinity, pairing the formulaic score with natural language AI justification.
3. **Verified YouTube Telemetry Engine:** Creators link channels via OAuth or direct handle/URL ingestion. A live video analyzer ingests YouTube metrics (views, likes, comments, engagement rate) and locks baseline view counts ($V_0$) upon submission.
4. **Automated CPM Escrow Distribution:** When a campaign launches, credits are escrowed in a double-entry ledger. As published videos gain verified incremental views ($\Delta V = V_t - V_0$), the platform automatically calculates earnable rewards and disburses credits from escrow directly to the creator's wallet without manual intervention.
5. **Real-Time Collaboration & Direct Messaging:** Built-in in-app messaging enables brands and creators to coordinate deliverables, review pitches, and approve drafts in real time.

---

## 3. Test Access & Pre-Configured Credentials

Evaluators can test the entire platform without creating new accounts. All accounts are pre-seeded with populated profiles, active campaigns, historical metrics, and ledger balances.

| Role | Email | Password | Pre-loaded Context |
|---|---|---|---|
| **Brand (Apex Audio Labs)** | `brand@creatoros.io` | `Password123!` | 9,000+ Credits balance, 2 active campaigns, product catalog, escrow reservations |
| **Creator (Tech & Reviews)** | `creator@creatoros.io` | `Password123!` | @alexriveratech, 450K+ verified views, linked YouTube stats, earnings balance |
| **Creator (Design & Visuals)** | `elena@creatoros.io` | `Password123!` | @elenadesigns, AI Animation specialist, portfolio items |
| **Creator (Code & Dev)** | `marcus@creatoros.io` | `Password123!` | @marcuscode, Developer workstation reviews |
| **Platform Administrator** | `admin@creatoros.io` | `Password123!` | System-wide telemetry, user status overrides, audit ledger review |

> [!TIP]
> **One-Click Role Switcher:** When viewing the application header in desktop view, click **"Demo Switcher"** to instantly jump between Brand, Creator, and Admin workspaces without typing credentials.

---

## 4. Evaluation Notes & Step-by-Step Testing Guide

### 🎬 Workflow 1: Brand Experience (Campaign Launch & Escrow)
1. **Log in as Brand** (`brand@creatoros.io` / `Password123!`).
2. **Review Real Overview Metrics:** Notice dynamic counters for **Credit Balance**, **Active Campaigns**, **Partnered Creators**, and **Total Verified Views** (no dummy/mock numbers).
3. **Products & AI Briefs (`Products & Briefs` tab):**
   - Click **"Create Product"**. Enter a title (e.g. `Quantum Wireless Earbuds`), category, and brief description.
   - Click **"✨ AI Analyze Product"** to watch the LLM synthesize unique selling points, target demographics, and recommended video formats. Click **"Save Product"**.
4. **Deploy CPM Campaign (`Campaigns Manager` tab):**
   - Click **"Create Campaign"**. Select your product, enter title and objective.
   - Click **"✨ AI Assist Brief"** to auto-generate creative hooks and deliverables.
   - Set Budget (e.g. `1,000 Credits`) and CPM Rate (e.g. `₹50`). Click **"Launch Campaign"**.
   - Notice credits are automatically deducted from available balance and locked into **Reserved Escrow**.
5. **Review Creator Applicants:** Click **"View Applicants"** on any campaign to inspect pitches and click **"Accept Creator"** or **"Decline"**.

---

### 🎨 Workflow 2: Creator Experience (Discovery, AI Pitch & Video Linking)
1. **Switch to Creator** (`creator@creatoros.io` / `Password123!`).
2. **Discover Campaigns & Generate AI Pitch (`Discover Campaigns` tab):**
   - Browse marketplace campaigns. Click **"Apply to Campaign"**.
   - In the modal, click **"✨ AI Generate Pitch"**: the LLM analyzes the campaign requirements and your creator persona to craft a personalized pitch proposal. Click **"Submit Application"**.
3. **YouTube Channel & Video Analyzer (`YouTube Channel & Metrics` tab):**
   - **URL Channel Linking:** In the **"Link Channel URL / @handle"** tab, enter `@mkbhd` or any YouTube channel link and click **"Link Channel via URL"** to inspect live channel stats.
   - **Live Video Analyzer:** In the **"Live Video Analyzer"** tab, paste any public YouTube video link (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`) and click **"Analyze Video Performance"**. Real view count, likes, engagement %, and projected CPM rewards are calculated. Click **"Add to AI Portfolio"** to save it.
4. **Verified Performance & Payout Engine (`Campaign Performance & Payouts` tab):**
   - Click **"+ Submit Published Content Link"**. Paste your YouTube video URL. Notice the modal queries live video metadata and locks baseline views ($V_0$).
   - Click **"Evaluate View Snapshot & Trigger CPM Payout"**: the engine evaluates new views, calculates incremental views ($\Delta V$), releases escrow credits into the creator's wallet, and logs an immutable ledger entry.
5. **Ledger & Top-Up (`Earnings & Ledger` tab):**
   - View double-entry ledger entries. Click **"+ Top Up Credits"** and select a preset (`+1,000 Credits`) to top up balance.

---

### 💬 Workflow 3: Direct In-App Messaging
1. Go to **Messages** tab in either workspace.
2. Active conversation threads appear on the left.
3. Type and send a message; the message is stored via `POST /api/v1/messages/conversations/:id/messages` and updates in real time.

---

## 5. Mathematical & Architectural Integrity Notes

### A. View Delta & CPM Escrow Formula
$$\Delta \text{Views} = \max(0, V_{\text{current}} - V_{\text{baseline}})$$
$$\text{Earnable Credits} = \text{floor}\left(\left(\frac{\Delta \text{Views}}{1,000}\right) \times \text{CPM Rate}\right)$$
$$\text{Payout} = \min\left(\text{Earnable Credits} - \text{Earned Previously}, \text{Remaining Campaign Escrow}\right)$$

### B. Statistical Consistency Score ($S_{\text{consistency}}$)
$$\text{CV} = \left(\frac{\sigma}{\mu}\right) \times 100, \quad S_{\text{consistency}} = \max\left(10, \min\left(100, 100 - \text{CV}\right)\right)$$

### C. Security & Data Protection
* **AES-256-GCM Encryption:** Sensitive OAuth tokens and YouTube tokens are encrypted at rest with authenticated IV and authentication tags.
* **Double-Entry Auditing:** Every credit movement records balanced debit/credit entries in PostgreSQL.
* **Zero Dummy Data:** All dashboard numbers, creators, campaigns, and messages are backed by PostgreSQL and Prisma ORM.

---

## 6. Technical Stack
* **Frontend:** React 18, Vite, TypeScript, Lucide Icons, Custom B2B Light-Mode Design System.
* **Backend:** Node.js 20, Express 4, TypeScript (ESM), Helmet, CORS, Express-Rate-Limit, Winston Logger, Zod.
* **Database & ORM:** PostgreSQL 16 with pgvector, Prisma ORM 5 (24 normalized models, 10 enums, baseline migration).
* **AI Provider:** Multi-model OpenRouter Engine (Google Gemma, Mistral, Llama) with structured heuristic failover.
* **Tests:** Automated test suite with 22/22 assertions verified (100% pass rate).
