# CreatorOS — AI Architecture & OpenRouter Integration

## 1. AI Design Philosophy
1. **Separation of Reasoning vs. Calculation:** AI models in CreatorOS are strictly utilized for understanding unstructured text, extracting key product propositions, summarizing guidelines, generating creative campaign ideas, and providing natural-language explanations for match scores.
2. **Deterministic Number Guard:** LLMs are **never** permitted to generate or decide numerical performance metrics, creator ranking scores, CPM reward balances, or financial adjustments.
3. **Model Decoupling:** The architecture prevents vendor/model lock-in. No controller or service contains hardcoded checks like `if (model === "...")`.

---

## 2. OpenRouter & Free Router (`openrouter/free`) Handling
CreatorOS defaults to OpenRouter's dynamic free tier:
- Config: `OPENROUTER_MODEL=openrouter/free`
- The `openrouter/free` router selects available free models on the fly (e.g. models from Google, NVIDIA, Cohere, Liquid, Poolside, Thinking Machines, etc.).
- **Resilience Strategy:**
  - Standardized system prompting with strict JSON schemas.
  - Robust JSON parsing with sanitization for models that output markdown fences or leading whitespace.
  - Retry logic with exponential backoff on HTTP 429 (Rate Limit) and HTTP 503 (Model Overloaded).
  - Detailed error capturing and fallback defaults when structured extraction fails.
  - Full audit logging into `AIUsage` table with latency, estimated token count, and platform credit cost.

---

## 3. AIService Core Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Domain Controllers                   │
│   (ProductController, CampaignController, MatchEngine) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                       AIService                        │
│  - Credit validation & deduction check                 │
│  - Prompt assembly & schema injection                  │
│  - Response sanitization & JSON schema validation      │
│  - Usage logging (AIUsage entity)                      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   OpenRouterProvider                   │
│  - OpenRouter API client                               │
│  - Dynamic model routing (openrouter/free)             │
│  - HTTP retries, timeouts & rate limit handling        │
└────────────────────────────────────────────────────────┘
```

---

## 4. Key AI Capabilities & Use Cases

### 4.1 Product Understanding (`analyzeProduct`)
- **Input:** Product title, website URL, raw text description, features, target audience.
- **Output (Structured JSON):**
  - Unique Selling Points (USPs)
  - Key audience segments (demographics, interests)
  - Recommended content formats (tutorials, unboxings, short-form reels)
  - Compliance and prohibited claims guidelines.

### 4.2 Campaign Brief Assistant (`assistCampaignBrief`)
- **Input:** Product data, campaign objective (awareness vs. conversion), budget, target audience.
- **Output:**
  - High-converting campaign hooks
  - Creator brief instructions
  - Suggested call-to-actions (CTAs) and hashtags.

### 4.3 Semantic Match Explanation (`explainMatch`)
- **Input:** Deterministic match score components (Audience Fit, Content Fit, Consistency, CPM Fit) + Creator bio + Product category.
- **Output:** 2-sentence objective summary explaining why this creator aligns with the campaign.
