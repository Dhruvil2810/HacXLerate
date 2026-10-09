# CreatorOS — Internal Credit & Ledger Architecture

## 1. Credit Concept & Purpose
In Phase 1, **Credits** serve as the platform's internal unit of account for:
1. **Brand Campaign Budgets & Escrow Reservations**
2. **Performance-based Creator Rewards (CPM model)**
3. **AI Operation Consumption (AI brief generation, product analysis)**
4. **Admin Balancing and Promotional Grants**

Credits are not treated as real fiat money in Phase 1; however, the double-entry accounting ledger is designed to seamlessly interface with payment gateways (Stripe, Razorpay) in future phases.

---

## 2. Immutable Ledger Rules
1. **No direct balance mutation:** Account balances in `CreditWallet` are strictly derived or synced from the sum of transactions in `CreditLedgerEntry`.
2. **Negative Balance Prevention:** Balances cannot drop below zero for user-initiated transactions.
3. **Idempotency Keys:** Every financial transaction requires a unique UUID idempotency key to prevent double charging.
4. **Transaction Types:**
   - `CREDIT_GRANT`: Initial onboarding credits or promotional grants.
   - `AI_USAGE`: Deductions for AI analysis or generation tasks.
   - `CAMPAIGN_RESERVATION`: Escrow reservation when a brand publishes a campaign.
   - `CAMPAIGN_REWARD`: Performance reward credited to a creator upon verified views.
   - `CAMPAIGN_RELEASE`: Release of unspent reserved budget back to brand upon campaign completion.
   - `CAMPAIGN_REFUND`: Refund of cancelled campaign budget.
   - `ADMIN_ADJUSTMENT`: Manual audit-logged correction by an admin.
   - `REVERSAL`: Disputed or fraudulent metric rollback.

---

## 3. Mathematical Formula for CPM Campaign Rewards
For a campaign with CPM rate $R$ (credits per 1,000 verified views):

$$\text{Earned Credits} = \left\lfloor \frac{\Delta \text{Verified Views}}{1000} \times R \right\rfloor$$

Example:
- Incremental Verified Views = 42,500
- Campaign CPM = 60 credits / 1k views
- Reward = $\frac{42,500}{1,000} \times 60 = 2,550\text{ credits}$
