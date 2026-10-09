# CreatorOS — YouTube Social Connector & Verification Architecture

## 1. Authentication & OAuth 2.0 Flow
Phase 1 implements official Google OAuth 2.0 integration for YouTube channels. Creators never share raw API keys. The platform owns the Google Cloud App credentials.

### OAuth Flow:
1. Creator clicks "Connect YouTube" in CreatorOS settings.
2. Backend generates state token and redirects creator to Google Consent Screen:
   - Scopes requested:
     - `https://www.googleapis.com/auth/youtube.readonly` (Channel & video metadata)
     - `https://www.googleapis.com/auth/yt-analytics.readonly` (Audience and performance analytics)
     - `https://www.googleapis.com/auth/userinfo.profile` (Profile verification)
3. Creator consents; Google redirects to `/api/v1/social/youtube/callback?code=...&state=...`.
4. Backend exchanges auth code for `access_token` and `refresh_token`.
5. Tokens are encrypted at rest (AES-256-GCM) in `SocialOAuthCredential`.
6. Channel is created under `SocialAccount` with status `VERIFIED`.

---

## 2. YouTube Data Ingestion Pipeline

### 2.1 Channel Data (`channels.list`)
- Channel ID, Title, Description, Custom URL, Avatar URL, Total Subscribers, Total Channel Views, Video Count.

### 2.2 Video Inventory (`search.list` & `videos.list`)
- Video ID, Title, Description, Thumbnail, Published Date, Duration, Category ID, Tags, Views, Likes, Comments.

### 2.3 YouTube Analytics API (`reports.query`)
- Daily views, estimated minutes watched, average view duration, likes, comments, shares, subscribers gained/lost.
- Demographics: Age group breakdowns, Gender percentages, Geographic viewer distributions (Top countries).

---

## 3. Incremental Performance Snapshot Engine
To support fair and accurate CPM reward calculations, the system never overwrites historical analytics records. It creates immutable snapshots:

$$\Delta \text{Views} = \text{Views}(T_{\text{latest}}) - \text{Views}(T_{\text{start}})$$

```
Day 0 (Published): 1,000 views  --> Baseline
Day 1:             6,500 views  --> Δ = 5,500 views
Day 2:            14,000 views  --> Δ = 7,500 views
Total Qualifying Incremental Views = 13,000 views
```

---

## 4. Verification Tiers & Badge Representation
Every metric on CreatorOS is strictly labeled:
- **`VERIFIED` (✓ Platform Verified):** Imported directly from authenticated YouTube API.
- **`UPLOADED` (📄 Uploaded Document):** Creator-uploaded CSV or PDF analytics exports.
- **`SELF_REPORTED` (⚠ Self Reported):** Manually entered values during profile onboarding.
