# CreatorOS — Security & Compliance Architecture

## 1. Authentication & Session Security
- **Passwords:** Hashed using `bcryptjs` with salt work factor 12.
- **JWT Strategy:** Signed using RS256/HS256 with strong secrets (`JWT_SECRET`). Tokens expire in 15 minutes; refresh tokens in 7 days.
- **Cookie Security:** Auth tokens delivered via HTTP-Only, Secure, `SameSite=Lax` cookies.
- **Role Verification:** Multi-role RBAC checked in backend middleware on every protected route. Never trust role flags sent from client payloads.

---

## 2. API Protection & Network Security
- **Helmet:** Sets secure HTTP response headers (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
- **CORS:** Strict origin whitelist restricted to configured frontend origins (`CORS_ORIGIN`).
- **Rate Limiting:** `express-rate-limit` to prevent brute force attacks on `/api/v1/auth/*` (15 req/15 min) and general endpoints (100 req/min).
- **Request Validation:** Strict Zod schema validation on all query params, route parameters, and request bodies.
- **Input Sanitization:** Stripping malicious HTML/script injection tags before persistence.

---

## 3. OAuth & Token Encryption at Rest
- **Token Protection:** Google OAuth refresh and access tokens are encrypted at rest using AES-256-GCM before storage in PostgreSQL.
- **State Verification:** State parameters during OAuth flows are signed cryptographic nonces preventing CSRF attacks.

---

## 4. Append-Only Audit Logging
Every significant identity, campaign, financial, and admin action writes an immutable record to the `AuditLog` table containing:
- `actorId`, `action`, `entityType`, `entityId`, `ipAddress`, `userAgent`, `metadata`, `createdAt`.
