# PassAddis Payment Facilitator Roadmap

## Executive Summary

PassAddis aims to become a **Payment Facilitator** (PayFac) in Ethiopia, similar to Chapa and ArifPay. This document outlines the strategy, architecture, and roadmap to achieve this goal.

---

## What is a Payment Facilitator?

A Payment Facilitator (PayFac) is a company that enables other businesses (merchants/sub-merchants) to accept electronic payments without each merchant needing their own direct relationship with payment processors.

### How PayFacs Make Money
```
Customer pays 100 ETB
    ↓
Payment processor fee: 1.5% (1.50 ETB) → Telebirr/Banks
PayFac fee: 3.5% (3.50 ETB) → PassAddis keeps this
    ↓
Merchant receives: 95 ETB
```

### Examples in Ethiopia
- **Chapa** - Payment facilitator using Telebirr, CBE Birr underneath
- **ArifPay** - Similar model
- **Santim Pay** - Similar model

---

## PassAddis Journey: 3 Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PASSADDIS PAYMENT EVOLUTION                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1              PHASE 2                    PHASE 3                    │
│  (Now)                (6-12 months)              (12-24 months)             │
│                                                                             │
│  ┌──────────┐         ┌──────────────┐          ┌──────────────────┐       │
│  │ Platform │         │  Payment     │          │    Payment       │       │
│  │ with     │   →     │  Facilitator │    →     │    Aggregator    │       │
│  │ Chapa    │         │  (Telebirr)  │          │    (PSO License) │       │
│  └──────────┘         └──────────────┘          └──────────────────┘       │
│                                                                             │
│  Use Chapa as         Direct Telebirr           Issue sub-shortcodes       │
│  payment backend      merchant account          to merchants               │
│                                                                             │
│  Build user base      Process payments          Full payment switch        │
│  Prove business       directly                  capabilities               │
│  model                                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Platform with Chapa (Current)

### Goal
Build user base and prove business model using Chapa as payment infrastructure.

### Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 1 ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────┐                                                             │
│    │ Customer │                                                             │
│    └────┬─────┘                                                             │
│         │ 1. Selects "PassAddis Pay"                                        │
│         ▼                                                                   │
│    ┌──────────────────┐                                                     │
│    │   PassAddis App  │                                                     │
│    │   (Frontend)     │                                                     │
│    └────────┬─────────┘                                                     │
│             │ 2. POST /api/payments/initiate                                │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │  PassAddis API   │                                                     │
│    │   (Backend)      │                                                     │
│    │                  │                                                     │
│    │  - Create order  │                                                     │
│    │  - Track payment │                                                     │
│    │  - Calculate     │                                                     │
│    │    commission    │                                                     │
│    └────────┬─────────┘                                                     │
│             │ 3. Call Chapa API                                             │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │   Chapa API      │  ◄── Chapa takes ~2.9%                              │
│    │                  │                                                     │
│    └────────┬─────────┘                                                     │
│             │ 4. Process payment                                            │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │ Telebirr/CBE/    │                                                     │
│    │ Bank Transfer    │                                                     │
│    └────────┬─────────┘                                                     │
│             │ 5. Money lands in                                             │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │ PassAddis Chapa  │                                                     │
│    │ Wallet           │                                                     │
│    └────────┬─────────┘                                                     │
│             │ 6. Manual settlement                                          │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │ Event Organizers │                                                     │
│    │ / Vendors        │                                                     │
│    └──────────────────┘                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Revenue Model (Phase 1)
```
Ticket Price:                    500 ETB
+ PassAddis Service Fee (5%):     25 ETB
= Customer Pays:                 525 ETB

Breakdown:
- Chapa fee (~2.9%):             15.23 ETB → Chapa
- PassAddis profit:               9.77 ETB → You keep
- Organizer receives:           500.00 ETB → Settled to organizer
```

### What You Need
- [x] Chapa account (sign up at https://chapa.co)
- [x] Basic KYC verification
- [x] Test API keys (instant)
- [x] Live API keys (1-2 days)

### Technical Implementation
```typescript
// Payment flow in PassAddis
async initiatePayment(orderId: string, amount: number) {
  // 1. Create payment record in your database
  const payment = await this.prisma.payment.create({
    data: {
      orderId,
      amount,
      method: 'CHAPA',
      status: 'PENDING',
    }
  });

  // 2. Call Chapa to create checkout
  const chapaResponse = await this.chapaProvider.initiatePayment({
    amount,
    tx_ref: payment.id,
    callback_url: 'https://api.passaddis.com/payments/webhook',
    return_url: 'https://passaddis.com/orders/' + orderId,
    customization: {
      title: 'PassAddis Pay',  // YOUR branding
      description: 'Event ticket purchase',
    }
  });

  // 3. Return checkout URL to customer
  return { checkoutUrl: chapaResponse.checkout_url };
}
```

### Customer Experience
1. Customer sees **"Pay with PassAddis"** button
2. Redirected to Chapa's checkout (can be customized)
3. Selects Telebirr/CBE Birr/Bank
4. Completes payment
5. Returns to PassAddis with confirmation

**Key Point:** Customer associates payment with PassAddis, not Chapa.

---

## Phase 2: Payment Facilitator (6-12 months)

### Goal
Get direct Telebirr merchant account and process payments without intermediary.

### Requirements
1. **Ethiopian Business License** - Registered company
2. **Telebirr Merchant Account** - Apply to Ethio Telecom
3. **Technical Integration** - VPN access to Telebirr API
4. **Transaction History** - Show NBE you have real business

### Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 2 ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────┐                                                             │
│    │ Customer │                                                             │
│    └────┬─────┘                                                             │
│         │                                                                   │
│         ▼                                                                   │
│    ┌──────────────────┐                                                     │
│    │   PassAddis App  │                                                     │
│    └────────┬─────────┘                                                     │
│             │                                                               │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │  PassAddis API   │                                                     │
│    │                  │                                                     │
│    │  YOUR Telebirr   │  ◄── Direct integration                             │
│    │  Merchant        │      Lower fees (~1.5%)                             │
│    │  Account         │      Full control                                   │
│    │                  │                                                     │
│    └────────┬─────────┘                                                     │
│             │                                                               │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │ Telebirr API     │                                                     │
│    │ (Direct)         │                                                     │
│    └────────┬─────────┘                                                     │
│             │                                                               │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │ PassAddis Bank   │                                                     │
│    │ Account          │                                                     │
│    └────────┬─────────┘                                                     │
│             │                                                               │
│             ▼                                                               │
│    ┌──────────────────┐                                                     │
│    │ Organizers/      │                                                     │
│    │ Vendors          │                                                     │
│    └──────────────────┘                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Revenue Model (Phase 2)
```
Ticket Price:                    500 ETB
+ PassAddis Service Fee (5%):     25 ETB
= Customer Pays:                 525 ETB

Breakdown:
- Telebirr fee (~1.5%):           7.88 ETB → Telebirr
- PassAddis profit:              17.12 ETB → You keep (75% more than Phase 1!)
- Organizer receives:           500.00 ETB
```

### Telebirr Integration Requirements
```
Credentials needed from Ethio Telecom:
- appId: "your-app-id"
- appKey: "your-app-key"
- publicKey: "RSA public key for encryption"
- shortCode: "your-shortcode"
- VPN access to Telebirr API servers
```

### Technical Implementation
```typescript
// Direct Telebirr integration
async initiatePayment(orderId: string, amount: number) {
  // 1. Create signed request
  const timestamp = Date.now().toString();
  const nonce = uuid();

  const payload = {
    appId: this.appId,
    shortCode: this.shortCode,
    nonce,
    notifyUrl: 'https://api.passaddis.com/payments/telebirr/callback',
    returnUrl: 'https://passaddis.com/orders/' + orderId,
    subject: 'PassAddis Payment',
    totalAmount: amount.toString(),
    outTradeNo: orderId,
    timeoutExpress: '30',
  };

  // 2. Encrypt with Telebirr's public key
  const encrypted = this.encryptPayload(payload);

  // 3. Call Telebirr API directly
  const response = await axios.post(
    'https://api.ethiotelecom.et/payment/initiate',
    { ussd: encrypted },
    { headers: { 'Authorization': `Bearer ${this.appKey}` } }
  );

  return { checkoutUrl: response.data.toPayUrl };
}
```

---

## Phase 3: Payment Aggregator (12-24 months)

### Goal
Become a licensed Payment System Operator (PSO) and offer payment services to other businesses.

### Requirements
1. **PSO License from NBE** - National Bank of Ethiopia
2. **Minimum Capital** - As per NBE requirements
3. **Compliance Team** - AML/KYC procedures
4. **Sub-merchant Management** - Onboard other businesses

### Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 3 ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         ┌──────────────────────┐                            │
│                         │   PassAddis Platform │                            │
│                         │   (Payment Switch)   │                            │
│                         └──────────┬───────────┘                            │
│                                    │                                        │
│              ┌─────────────────────┼─────────────────────┐                  │
│              │                     │                     │                  │
│              ▼                     ▼                     ▼                  │
│    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│    │   Sub-Merchant   │  │   Sub-Merchant   │  │   Sub-Merchant   │        │
│    │   (Restaurant)   │  │   (Event Co.)    │  │   (Shop)         │        │
│    │                  │  │                  │  │                  │        │
│    │   Sub-shortcode  │  │   Sub-shortcode  │  │   Sub-shortcode  │        │
│    │   PA-REST-001    │  │   PA-EVT-002     │  │   PA-SHP-003     │        │
│    └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │                    Payment Processing Layer                      │     │
│    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │     │
│    │  │Telebirr │  │CBE Birr │  │ Awash   │  │  VISA   │            │     │
│    │  │         │  │         │  │  Bank   │  │         │            │     │
│    │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │                    Settlement & Reconciliation                   │     │
│    │                                                                  │     │
│    │  Daily automated settlements to sub-merchant bank accounts       │     │
│    │  Real-time reporting and analytics                               │     │
│    │  Compliance and fraud detection                                  │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Revenue Model (Phase 3)
```
Transaction: 1000 ETB

Breakdown:
- Bank/Telebirr fee: 1.0% (10 ETB)
- PassAddis fee: 2.5% (25 ETB) → Your revenue
- Sub-merchant receives: 965 ETB

Additional Revenue:
- Monthly subscription fees from sub-merchants
- Setup fees for new merchants
- Premium features (analytics, instant settlement)
- API access fees for developers
```

### PSO License Requirements (NBE)
1. Minimum paid-up capital (check current NBE requirements)
2. Business plan and feasibility study
3. IT infrastructure audit
4. AML/CFT compliance program
5. Management team qualifications
6. Transaction history and volume data

---

## Database Schema for Payment Facilitator

```prisma
// Merchant (Sub-merchant) Management
model Merchant {
  id              String   @id @default(uuid())
  businessName    String
  contactEmail    String
  contactPhone    String
  bankAccount     String
  bankName        String

  // Settlement configuration
  commissionRate  Float    @default(5.0)  // PassAddis takes 5%
  settlementDays  Int      @default(3)    // T+3 settlement

  // Wallet for tracking balances
  walletBalance   Float    @default(0)
  pendingBalance  Float    @default(0)

  // Status
  status          MerchantStatus @default(PENDING)
  verifiedAt      DateTime?

  // Relations
  transactions    Payment[]
  settlements     Settlement[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Track all transactions
model Payment {
  id              String   @id @default(uuid())

  // Transaction details
  amount          Float
  currency        String   @default("ETB")
  method          PaymentMethod
  status          PaymentStatus

  // References
  orderId         String   @unique
  merchantId      String?
  merchant        Merchant? @relation(fields: [merchantId], references: [id])

  // Provider details
  providerRef     String?  // Chapa tx_ref or Telebirr outTradeNo
  providerData    Json?    // Full response from provider

  // Commission tracking
  grossAmount     Float    // What customer paid
  commissionAmount Float?  // PassAddis commission
  netAmount       Float?   // What merchant receives

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Settlement records
model Settlement {
  id              String   @id @default(uuid())
  merchantId      String
  merchant        Merchant @relation(fields: [merchantId], references: [id])

  amount          Float
  status          SettlementStatus
  bankReference   String?

  // Period covered
  periodStart     DateTime
  periodEnd       DateTime

  processedAt     DateTime?
  createdAt       DateTime @default(now())
}

enum MerchantStatus {
  PENDING
  ACTIVE
  SUSPENDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}

enum SettlementStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## API Endpoints for Payment Facilitator

### For Customers (PassAddis App Users)
```
POST /api/payments/initiate
  - Create payment for ticket/shop order
  - Returns checkout URL

GET /api/payments/:id/status
  - Check payment status

POST /api/payments/webhook/chapa
  - Receive Chapa webhook notifications
```

### For Merchants/Organizers (Dashboard)
```
GET /api/merchant/dashboard
  - Overview: balance, pending, recent transactions

GET /api/merchant/transactions
  - List all transactions with filters

GET /api/merchant/settlements
  - Settlement history

POST /api/merchant/request-settlement
  - Request early settlement (if supported)
```

### For Admin (PassAddis Internal)
```
GET /api/admin/merchants
  - List all merchants

POST /api/admin/merchants/:id/approve
  - Approve merchant application

POST /api/admin/settlements/process
  - Process pending settlements

GET /api/admin/reports/revenue
  - Revenue reports and analytics
```

---

## Key Metrics to Track

### For NBE License Application
1. **Transaction Volume** - Monthly transactions processed
2. **Transaction Value** - Total ETB processed
3. **Active Users** - Monthly active customers
4. **Active Merchants** - Event organizers using platform
5. **Settlement Rate** - % of successful settlements
6. **Dispute Rate** - % of disputed transactions

### Dashboard Metrics
```
┌─────────────────────────────────────────────────────────────┐
│                    PassAddis Dashboard                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Total Processed     Active Merchants    Revenue (MTD)       │
│  ┌──────────┐       ┌──────────┐        ┌──────────┐        │
│  │ 2.5M ETB │       │    45    │        │ 125K ETB │        │
│  └──────────┘       └──────────┘        └──────────┘        │
│                                                              │
│  Pending Settlement  Success Rate       Avg Transaction      │
│  ┌──────────┐       ┌──────────┐        ┌──────────┐        │
│  │ 340K ETB │       │  98.5%   │        │  850 ETB │        │
│  └──────────┘       └──────────┘        └──────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Timeline & Milestones

### Phase 1: Months 1-6
- [x] Build PassAddis platform (tickets, shop)
- [x] Set up AWS infrastructure
- [ ] Integrate Chapa for payments
- [ ] Launch beta with 5-10 event organizers
- [ ] Process first 1000 transactions
- [ ] Reach 5000 registered users

### Phase 2: Months 6-12
- [ ] Apply for Telebirr merchant account
- [ ] Build transaction history (NBE requirement)
- [ ] Implement direct Telebirr integration
- [ ] Add CBE Birr direct integration
- [ ] Process 10,000+ transactions
- [ ] Onboard 50+ event organizers

### Phase 3: Months 12-24
- [ ] Apply for PSO license
- [ ] Build sub-merchant management system
- [ ] Implement automated settlements
- [ ] Add more payment methods (banks, cards)
- [ ] Launch merchant API for third parties
- [ ] Expand beyond events (general commerce)

---

## Risk Considerations

### Regulatory Risks
- NBE may change licensing requirements
- New fintech regulations may apply
- Telebirr/CBE terms may change

### Technical Risks
- Telebirr API availability
- Settlement delays
- Fraud and chargebacks

### Business Risks
- Competition from Chapa, ArifPay
- Customer acquisition costs
- Merchant churn

### Mitigation Strategies
1. Stay close to NBE developments
2. Build redundancy (multiple payment providers)
3. Strong fraud detection
4. Excellent merchant support
5. Competitive pricing

---

## Summary

PassAddis is building toward becoming a licensed Payment Facilitator in Ethiopia. The journey involves:

1. **Start with Chapa** - Use existing infrastructure to build user base
2. **Get Telebirr Direct** - Lower costs, more control
3. **Obtain PSO License** - Become a full payment aggregator

The key is building transaction volume and proving the business model to NBE while the licensing process proceeds.

**Next Step:** Sign up at https://chapa.co and get your API keys to start Phase 1.

---

*Document created: December 2024*
*Last updated: December 2024*
