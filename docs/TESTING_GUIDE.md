# CreatorOS — Complete Feature Testing Guide

This guide provides step-by-step instructions to test and verify every module of the **CreatorOS AI-Native Creator Marketplace** end-to-end.

---

## 1. System Architecture & Prerequisites

### 1.1 Service Ports
| Service | URL / Port | Technology | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | React 18, Vite, Lucide Icons | Active |
| **Backend API** | `http://localhost:5000` | Node.js, Express, TypeScript | Active (`/api/v1`) |
| **Database** | `localhost:5433` | PostgreSQL 16 + pgvector (Docker) | Active |
| **AI Engine** | Cloud API | OpenRouter (`openrouter/free`) | Active |
| **Social API** | OAuth 2.0 | Google OAuth & YouTube Data v3 | Active |

### 1.2 Default Test Accounts
All test accounts are seeded in the database with password: `Password123!`
* **Brand Account:** `brand@creatoros.io`
* **Creator Account:** `creator@creatoros.io`
* **Admin Account:** `admin@creatoros.io`

*(You can also register brand-new accounts directly from the UI with zero friction.)*

---

## 2. Feature-by-Feature Testing Walkthrough

### Test Case 1: Public Showcase & Marketing Landing Page
* **Goal:** Verify the public showcase has no internal developer roadmaps or fake client metrics, and offers live explore previews.
* **Steps:**
  1. Open `http://localhost:3000` in your browser (if signed in, click the Logout button in the top right).
  2. Verify the Hero section: "Connect brands with vetted AI creators through verified craft and measurable reach."
  3. Click **"Explore Verified AI Creators"**: Notice the live directory expands, querying database creators with active AI tool badges. Click it again to close.
  4. Click **"Explore Active Campaign Briefs"**: Notice open briefs with commercial licensing requirements display.
  5. Scroll down to review:
     - **Dual Engagement Model:** AI Creative Services (Fixed Fee) vs. Performance Campaigns (CPM).
     - **Supported AI Models:** Midjourney, Runway Gen-3, Sora, Kling, Flux.1, ComfyUI, ElevenLabs.
     - **Verification Standards:** Platform Verified, Evidence Reviewed, Creator Declared.
     - **Interactive FAQs:** Click any question to expand the answer.

---

### Test Case 2: Authentication & Multi-Role Switching
* **Goal:** Test JWT authentication, role-based workspace loading, and seamless workspace switching.
* **Steps:**
  1. Click **"Sign In"** in the top navigation bar.
  2. Click **"Brand Demo Login"** (or enter `brand@creatoros.io` / `Password123!`).
  3. Verify you are redirected to the **Brand Workspace** with your credit balance badge visible in the top header.
  4. Click the workspace switcher dropdown in the header (currently showing "BRAND").
  5. Select **"Creator Workspace"**: Notice the UI immediately re-renders the **Creator Workspace** under the same authenticated session.
  6. Click the switcher again and select **"Admin Control"**: The **Admin Governance Center** opens.

---

### Test Case 3: Product Management & OpenRouter AI Intelligence
* **Goal:** Create a product and use OpenRouter AI to extract USPs and target audience hooks.
* **Steps:**
  1. Switch to **Brand Workspace**.
  2. Click the **"Products & AI Intelligence"** tab.
  3. Click **"+ Add Product"**.
  4. Fill in:
     - **Product Name:** `Lumina HyperLens 8K`
     - **Category:** `Hardware & Peripherals`
     - **Description:** `Cinema-grade anamorphic lens attachment designed specifically for AI-augmented virtual production and iPhone 16 Pro video rigs.`
     - **Landing Page URL:** `https://luminaoptics.io`
  5. Click **"✨ AI Analyze & Extract Hooks"**.
  6. Verify the AI banner appears: OpenRouter extracts unique selling points and target audience parameters, auto-populating the form fields.
  7. Click **"Save Product"**: The product appears in your catalog card grid.

---

### Test Case 4: AI Brief Creation & Campaign Escrow
* **Goal:** Launch a performance campaign brief with escrowed credits.
* **Steps:**
  1. While in **Brand Workspace**, click the **"Campaigns & Briefs"** tab.
  2. Click **"+ Create Campaign"**.
  3. Fill in the campaign form:
     - **Title:** `Lumina HyperLens Cinematic Showcase`
     - **Product:** Select `Lumina HyperLens 8K`
     - **Budget Escrow:** `3000` Credits
     - **CPM Rate:** `₹55` per 1,000 views
     - **Target Categories:** `Tech, Video Production, AI Film`
  4. Click **"✨ AI Assist Brief"**: OpenRouter generates enhanced objectives and technical creator guidelines.
  5. Click **"Deploy Campaign & Escrow Credits"**.
  6. Verify the new campaign appears with status `APPLICATIONS_OPEN` and 3,000 credits committed in escrow.

---

### Test Case 5: Creator AI Portfolio & Workflow Manager
* **Goal:** Build a portfolio project specifying generative AI models, prompts, aspect ratios, and commercial rights.
* **Steps:**
  1. Switch to **Creator Workspace**.
  2. Click the **"AI Portfolio & Workflows"** tab.
  3. Click **"+ Add AI Project"**.
  4. Fill in:
     - **Project Title:** `Neo-Tokyo Cyberpunk Commercial`
     - **Media URL:** `https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200`
     - **Content Category:** `AI Commercials & Ads`
     - **Aspect Ratio:** `16:9`
     - **Resolution:** `4K (3840x2160)`
     - **AI Tools Used:** Check `Runway Gen-3`, `Midjourney`, and `ElevenLabs`
     - **Workflow Description:** `Initial concept art generated in Midjourney v6, motion synthesis rendered through Runway Gen-3 Alpha, custom node upscaling in ComfyUI.`
     - **Commercial Rights:** Select `Full Commercial Rights Granted`
  5. Click **"Publish Portfolio Project"**.
  6. Verify the project card renders with all AI tool badges, aspect ratio tags, and licensing indicators.

---

### Test Case 6: Creator Discovery with Real Multidimensional Filters
* **Goal:** Search creators using combined tool, skill, and verification filters.
* **Steps:**
  1. Switch to **Brand Workspace**.
  2. Click the **"Creator Discovery"** tab.
  3. In the search bar, type `Alex` or select category `Technology`.
  4. Under **"Filter by AI Tool / Pipeline"**, select `Runway` or `Midjourney`.
  5. Under **"Verification Level"**, select `Platform Verified`.
  6. Verify the creator results filter accurately in real time.
  7. Click **"Send Brief Invitation"** on any creator card to test the invite workflow.

---

### Test Case 7: Marketplace Discovery & Application Submission
* **Goal:** Have a creator discover an active brief and submit an application.
* **Steps:**
  1. Switch to **Creator Workspace**.
  2. Click the **"Discover Campaigns"** tab.
  3. Locate `Apex Pro ANC Wireless Earbuds Launch` (or your newly created campaign).
  4. Click **"Apply to Campaign"**.
  5. Enter a personalized pitch: `I specialize in 4K studio sound tests and AI-edited macro B-roll. Can deliver within 4 days.`
  6. Click **"Submit Application"**.
  7. Verify the success confirmation appears.

---

### Test Case 8: YouTube Analytics Connector & Live Sync
* **Goal:** Inspect connected YouTube channel analytics and snapshots.
* **Steps:**
  1. While in **Creator Workspace**, click the **"YouTube Channel & Metrics"** tab.
  2. Review the connected channel card displaying subscriber count, video count, and platform-verified total views.
  3. Click **"Sync YouTube Analytics"**: The system triggers a live analytics sync job and displays a confirmation banner.
  4. Click the **"Manual Entry / Evidence"** tab to test manual entry fallback with documentation upload.

---

### Test Case 9: Performance CPM Tracking & Reward Payout
* **Goal:** Submit a published YouTube video and verify deterministic CPM payout execution.
* **Steps:**
  1. In **Creator Workspace**, click the **"Campaign Performance & Payouts"** tab.
  2. Click **"+ Submit Published Content"**.
  3. Enter:
     - **YouTube URL:** `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
     - **Baseline Views:** `1,200`
     - **Current Views:** `28,400`
  4. Click **"Submit for Performance Tracking"**.
  5. In the Active Tracked Content table, click **"Ingest Snapshot & Pay"** on any row.
  6. The backend calculates:
     $$\text{Incremental Views} = 28,400 - 1,200 = 27,200$$
     $$\text{Earned Reward} = \lfloor(27,200 / 1,000) \times 65\rfloor = 1,768 \text{ Credits}$$
  7. Verify the payout status shows `COMPLETED` and the creator wallet balance increases!

---

### Test Case 10: Immutable Credit Ledger
* **Goal:** Verify double-entry ledger transactions for all platform operations.
* **Steps:**
  1. Click the **"Earnings & Ledger"** tab (in Creator) or **"Credit Ledger"** tab (in Brand).
  2. Review the **Double-Entry Credit Ledger** table.
  3. Notice each entry has an immutable timestamp, transaction type badge (`CAMPAIGN_REWARD`, `CAMPAIGN_RESERVATION`, `AI_USAGE`), reference ID, and signed credit amount ($+$ / $-$).
  4. Filter by transaction type using the dropdown (`All`, `Campaign Rewards`, `Campaign Escrow`, `AI Usage`).

---

### Test Case 11: Admin Governance & Controlled Adjustments
* **Goal:** Perform governance operations, account suspensions, and credit adjustments.
* **Steps:**
  1. Switch to the **ADMIN** role via the header switcher.
  2. Review the live system metrics: Total Users, Circulating Credits, AI Queries, and 100% Service Operational health.
  3. Under **User Directory & Account Status**, find any user and click **"Suspend"**. Notice the status badge switches to `SUSPENDED` and changes to `ACTIVE` upon unsuspending.
  4. Click **"Adjust User Credits"** in the top right.
  5. Select a target user, enter `+500` Credits, choose transaction type `CREDIT_GRANT`, and provide a mandatory audit reason: `Promotion credit for beta creator`.
  6. Click **"Execute Adjustment"**.
  7. Verify the action immediately appends to the **Append-Only Audit Trail (Recent Activity)** stream with the actor ID and metadata!

---

### Test Case 12: Automated Backend Test Suite
* **Goal:** Run the programmatic automated test suite covering encryption, math, and validation.
* **Command:**
  ```powershell
  cd "d:\Creater Market Place\backend"
  npm run test
  ```
* **Expected Result:**
  ```text
  🎉 ALL TESTS PASSED: 22 / 22 assertions verified (100%)
  ```
  - AES-256-GCM Encryption & Decryption
  - YouTube URL Parsing Engine (Watch, Shorts, Embed)
  - Statistical Scoring Engine (Deterministic Math)
  - Deterministic CPM Escrow Math
  - JWT Security Authentication
  - Zod Input Validation Schemas
