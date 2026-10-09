# CreatorOS — Technical Architecture Specification

## 1. High-Level Architectural Blueprint

CreatorOS utilizes a decoupled client-server architecture with strict modular service boundaries, deterministic calculation pipelines, and an isolated AI reasoning abstraction layer.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                         │
│  - Marketing Showcase Landing Page (Light-Mode B2B Design)             │
│  - Role-Switchable Workspace (Brand / Creator / Admin)                 │
│  - Analytics Dashboards, Data Tables, Charts, Messaging & Workflows   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Backend API (Node.js / Express / TS)                   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Security & Routing Layer: Helmet, CORS, RateLimiter, Auth, Zod    │ │
│ └─────────────────────────────────┬──────────────────────────────────┘ │
│                                   │                                    │
│ ┌─────────────────────────────────▼──────────────────────────────────┐ │
│ │ Modular Controllers & Domain Services                              │ │
│ │  ├─ Auth & User Service (Multi-role RBAC, OAuth handlers)         │ │
│ │  ├─ Brand & Product Service (Products, briefs, docs)               │ │
│ │  ├─ Creator & Portfolio Service (Profiles, verification, stats)    │ │
│ │  ├─ Campaign & Application Service (Lifecycle, matching engine)    │ │
│ │  ├─ Messaging Service (Conversations, message threads)             │ │
│ │  ├─ Credit & Ledger Service (Immutable double-entry balance)       │ │
│ │  ├─ Performance Engine (Incremental views, CPM calculations)      │ │
│ │  └─ Audit Service (Append-only immutable system logs)              │ │
│ └───────┬─────────────────────────┬──────────────────────────┬───────┘ │
│         │                         │                          │         │
│         ▼                         ▼                          ▼         │
│ ┌───────────────┐        ┌──────────────────┐       ┌────────────────┐ │
│ │  AI Provider  │        │ Social Connector │       │ Database Layer │ │
│ │  Abstraction  │        │   Abstraction    │       │  (Prisma ORM)  │ │
│ │ (OpenRouter)  │        │ (YouTube OAuth)  │       │                │ │
│ └───────┬───────┘        └────────┬─────────┘       └───────┬────────┘ │
└─────────┼─────────────────────────┼─────────────────────────┼──────────┘
          │                         │                         │
          ▼                         ▼                         ▼
   OpenRouter API           Google / YouTube APIs       PostgreSQL DB
   (openrouter/free)        (Data v3 / Analytics)     (Relational + pgvector)
```

---

## 2. Core Architectural Abstractions

### 2.1 Social Platform Connector Abstraction (`ISocialPlatformConnector`)
Allows YouTube in Phase 1 and enables seamless integration of Instagram, TikTok, and LinkedIn in subsequent phases without modifying controllers or campaign logic.

```typescript
export interface SocialPlatformConnector {
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK';
  generateAuthUrl(state: string): string;
  handleCallback(code: string): Promise<OAuthTokens>;
  getChannelProfile(tokens: OAuthTokens): Promise<NormalizedChannelProfile>;
  getPublishedContent(tokens: OAuthTokens, options?: QueryOptions): Promise<NormalizedContentItem[]>;
  getAnalyticsSnapshot(tokens: OAuthTokens, contentId: string, range?: DateRange): Promise<NormalizedAnalytics>;
  getAudienceDemographics(tokens: OAuthTokens): Promise<NormalizedAudienceData>;
  refreshTokens(refreshToken: string): Promise<OAuthTokens>;
}
```

### 2.2 AI Service & Provider Abstraction (`IAIProvider`)
Decouples application logic from specific LLM models or endpoints, enabling dynamic routing through `openrouter/free` while maintaining structured fallback resilience.

```typescript
export interface AIProvider {
  providerName: string;
  generateText(request: AITextRequest): Promise<AITextResponse>;
  generateStructuredOutput<T>(request: AIStructuredRequest<T>): Promise<AIStructuredResponse<T>>;
  createEmbedding(text: string): Promise<number[]>;
  summarize(content: string, context?: string): Promise<string>;
}
```

### 2.3 Payment & Settlement Abstraction (`IPaymentProvider` - Future Ready)
Provides the interface for Phase 2+ payment gateways (Stripe, Razorpay) while keeping Phase 1 grounded in the internal `CreditLedgerService`.

```typescript
export interface PaymentProvider {
  providerName: string;
  createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntentResult>;
  verifyWebhook(payload: any, signature: string): Promise<WebhookEvent>;
}
```

---

## 3. Data Integrity & Layer Separation Principle

Every piece of data stored and displayed in CreatorOS is strictly segregated by source:

1. **`PLATFORM_VERIFIED`**: Fetched directly via authorized OAuth APIs (e.g., YouTube Analytics API).
2. **`UPLOADED`**: Analytics files, exported CSVs, or proof screenshots uploaded by creators (marked `UNVERIFIED`).
3. **`SELF_REPORTED`**: Manually keyed numbers during onboarding or profile editing.
4. **`CALCULATED`**: Deterministic statistical computations (Mean, Median, StdDev, Coefficient of Variation, CPM, Delta Views).
5. **`AI_GENERATED`**: Semantic briefs, classification tags, audience fit explanations.

---

## 4. Deterministic Performance Calculation Pipeline

To ensure absolute financial and analytical trustworthiness:
- **No LLM computes financial rewards or statistical ranks.**
- **Incremental Views Formula:**
  $$\Delta \text{Views} = \text{Snapshot}_{t_n}.\text{views} - \text{Snapshot}_{t_{n-1}}.\text{views}$$
- **CPM Reward Formula:**
  $$\text{Reward Credits} = \left( \frac{\Delta \text{Verified Views}}{1000} \right) \times \text{Campaign CPM Rate}$$
- **Statistical Consistency Score:**
  $$\text{CV} = \frac{\sigma}{\mu} \times 100\% \quad \longrightarrow \quad \text{Consistency Score} = \max(0, 100 - \text{CV})$$
