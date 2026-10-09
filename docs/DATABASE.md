# CreatorOS — Database Schema & Data Dictionary

## 1. Relational Entity Overview
CreatorOS uses PostgreSQL via Prisma ORM. The relational model is fully normalized, robustly indexed, and built with foreign key constraints, enum types, and immutable audit structures.

```
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │ 1:N
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │ UserRole  │ │BrandProf. │ │CreatorProf│
       └───────────┘ └─────┬─────┘ └─────┬─────┘
                           │             │
                    1:N    ▼             ▼ 1:N
                    ┌───────────┐  ┌───────────┐
                    │  Product  │  │Portfolio  │
                    └─────┬─────┘  │SocialAcct │
                          │        └─────┬─────┘
                    1:N   ▼              │
                    ┌───────────┐        │
                    │ Campaign  │        │
                    └─────┬─────┘        │
                          │              │
                   1:N    ├──────────────┘
                          ▼
              ┌───────────────────────┐
              │  CampaignApplication  │
              │  CampaignCreator      │
              │  ContentSubmission    │
              │  PublishedContent     │
              │  AnalyticsSnapshot    │
              └───────────────────────┘
```

---

## 2. Core Entities & Schema Specifications

### 2.1 Identity, Roles & Profiles
- **`User`**: Core account entity (`id`, `email`, `passwordHash`, `name`, `avatarUrl`, `isEmailVerified`, `status`, `createdAt`, `updatedAt`).
- **`UserRole`**: Join table supporting multi-role assignment (`id`, `userId`, `role` [BRAND, CREATOR, ADMIN], `isPrimary`, `createdAt`).
- **`BrandProfile`**: Company profile (`id`, `userId`, `companyName`, `industry`, `websiteUrl`, `description`, `logoUrl`, `createdAt`, `updatedAt`).
- **`CreatorProfile`**: Creator profile (`id`, `userId`, `handle`, `bio`, `location`, `categories`, `skills`, `tools`, `contentTypes`, `statsSummary`, `createdAt`, `updatedAt`).
- **`PortfolioItem`**: Creator past work (`id`, `creatorId`, `title`, `description`, `mediaUrl`, `category`, `toolsUsed`, `metricsSummary`, `createdAt`).

### 2.2 Social Accounts & OAuth Credentials
- **`SocialAccount`**: Connected channel (`id`, `creatorId`, `platform` [YOUTUBE, INSTAGRAM, TIKTOK], `platformAccountId`, `accountName`, `avatarUrl`, `verificationStatus` [VERIFIED, UPLOADED, SELF_REPORTED], `verifiedAt`, `createdAt`, `updatedAt`).
- **`SocialOAuthCredential`**: Securely stored OAuth credentials (`id`, `socialAccountId`, `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiresAt`, `scope`, `updatedAt`).
- **`YouTubeChannel`**: Specific channel data (`id`, `socialAccountId`, `channelId`, `title`, `description`, `customUrl`, `subscriberCount`, `totalViews`, `videoCount`, `lastSyncedAt`).
- **`YouTubeVideo`**: Synced creator videos (`id`, `youtubeChannelId`, `videoId`, `title`, `description`, `thumbnailUrl`, `publishedAt`, `duration`, `views`, `likes`, `comments`, `lastSyncedAt`).
- **`YouTubeAnalyticsSnapshot`**: Time-series channel/video performance (`id`, `youtubeChannelId`, `videoId`, `snapshotDate`, `views`, `watchTimeMinutes`, `avgDurationSeconds`, `likes`, `comments`, `subscribersGained`, `subscribersLost`, `sourceType`, `createdAt`).

### 2.3 Products & Campaigns
- **`Product`**: Brand product definitions (`id`, `brandId`, `name`, `description`, `category`, `websiteUrl`, `usp`, `features`, `pricingDetails`, `targetAudience`, `brandGuidelines`, `aiAnalysis`, `createdAt`, `updatedAt`).
- **`Campaign`**: Performance marketing campaigns (`id`, `brandId`, `productId`, `title`, `objective`, `description`, `budgetCredits`, `allocatedCredits`, `spentCredits`, `rewardModel` [CPM, CPE, HYBRID], `cpmRate`, `status` [DRAFT, PUBLISHED, APPLICATIONS_OPEN, IN_PROGRESS, CONTENT_REVIEW, LIVE, COMPLETED, PAUSED, CANCELLED], `targetAudience`, `contentRequirements`, `prohibitedContent`, `ctaUrl`, `startDate`, `endDate`, `createdAt`, `updatedAt`).
- **`CampaignApplication`**: Applications submitted by creators (`id`, `campaignId`, `creatorId`, `pitch`, `proposedRate`, `status` [PENDING, ACCEPTED, REJECTED, WITHDRAWN], `aiMatchScore`, `aiMatchExplanation`, `createdAt`, `updatedAt`).
- **`CampaignCreator`**: Accepted creator participation (`id`, `campaignId`, `creatorId`, `status` [ACTIVE, SUBMITTED, APPROVED, PUBLISHED, COMPLETED], `totalVerifiedViews`, `earnedCredits`, `createdAt`, `updatedAt`).

### 2.4 Content Lifecycle & Published Tracking
- **`ContentSubmission`**: Draft assets before publishing (`id`, `campaignId`, `creatorId`, `draftText`, `mediaUrls`, `version`, `status` [DRAFT, SUBMITTED, BRAND_REVIEW, APPROVED, REJECTED, REVISION_REQUIRED], `brandFeedback`, `createdAt`, `updatedAt`).
- **`PublishedContent`**: Live published asset (`id`, `campaignId`, `creatorId`, `socialAccountId`, `platform` [YOUTUBE], `publishedUrl`, `externalContentId`, `publishedAt`, `status` [TRACKING, COMPLETED, FLAGGED], `initialViews`, `currentViews`, `incrementalViews`, `earnedCredits`, `createdAt`, `updatedAt`).
- **`AnalyticsSnapshot`**: Immutable point-in-time metrics for published content (`id`, `publishedContentId`, `snapshotTimestamp`, `views`, `incrementalViews`, `likes`, `comments`, `sourceType`, `createdAt`).

### 2.5 Credit Wallet & Ledger
- **`CreditWallet`**: Account wallet balance (`id`, `userId`, `balance`, `reservedBalance`, `lifetimeEarned`, `lifetimeSpent`, `updatedAt`).
- **`CreditLedgerEntry`**: Immutable transaction log (`id`, `walletId`, `userId`, `amount`, `type` [CREDIT_GRANT, AI_USAGE, CAMPAIGN_REWARD, CAMPAIGN_RESERVATION, CAMPAIGN_RELEASE, CAMPAIGN_REFUND, ADMIN_ADJUSTMENT, REVERSAL], `referenceType`, `referenceId`, `description`, `idempotencyKey`, `metadata`, `createdAt`).

### 2.6 Messaging, Audit & System Observability
- **`Conversation`**: Direct chat thread (`id`, `campaignId`, `createdAt`, `updatedAt`).
- **`ConversationParticipant`**: Chat member (`id`, `conversationId`, `userId`, `lastReadAt`).
- **`Message`**: Chat messages (`id`, `conversationId`, `senderId`, `content`, `attachments`, `createdAt`).
- **`AIUsage`**: AI request audit log (`id`, `userId`, `operation`, `model`, `promptTokens`, `completionTokens`, `creditCost`, `success`, `latencyMs`, `createdAt`).
- **`AuditLog`**: Append-only security & system event log (`id`, `actorId`, `action`, `entityType`, `entityId`, `ipAddress`, `userAgent`, `metadata`, `createdAt`).

---

## 3. Key Indexes & Performance Optimization
1. `User(email)` (Unique)
2. `UserRole(userId, role)` (Unique compound)
3. `SocialAccount(creatorId, platform)`
4. `YouTubeVideo(youtubeChannelId, videoId)` (Unique compound)
5. `YouTubeAnalyticsSnapshot(youtubeChannelId, videoId, snapshotDate)`
6. `Campaign(brandId, status)`
7. `CampaignApplication(campaignId, creatorId)` (Unique compound)
8. `CreditLedgerEntry(walletId, createdAt)` & `CreditLedgerEntry(idempotencyKey)` (Unique)
9. `PublishedContent(campaignId, externalContentId)`
10. `AuditLog(actorId, action, createdAt)`
