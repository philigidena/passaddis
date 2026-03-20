# PassAddis Feature Roadmap

> Last updated: 2026-03-19 | Phase 1 completed: 2026-03-19 | Phase 2 completed: 2026-03-19 (PayPal on hold)
> Track implementation status of all planned features.

---

## Phase 1 — Quick Wins

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1.1 | Saved/Favorited Events | ✅ DONE | Users can bookmark events for later. SavedEvent model + endpoints + UI |
| 1.2 | Calendar Integration | ✅ DONE | "Add to Google Calendar" / .ics download from event detail page |
| 1.3 | Waitlist Auto-Upgrade | ✅ DONE | Auto-notify + offer tickets to waitlisted users on cancellation/refund (FIFO) |
| 1.4 | Push Notifications | ✅ DONE | In-app notification system (bell icon, notification list, mark as read) |
| 1.5 | Gift Ticket Flow | ✅ DONE | "Buy as Gift" — sender pays, recipient gets ticket via SMS/WhatsApp |

---

## Phase 2 — Diaspora & Remittance

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 2.1 | Stripe Integration | ✅ DONE | International card payments (Visa/MC/Amex) for diaspora users |
| 2.2 | Multi-Currency Support | ✅ DONE | Display prices in USD/EUR/GBP/CAD, convert to ETB at checkout |
| 2.3 | Gift Wallet / PassAddis Balance | ✅ DONE | Diaspora loads wallet in USD/EUR, family spends on tickets/shop in ETB |
| 2.4 | Diaspora User Detection | ✅ DONE | Auto-detect country from IP/phone, show localized pricing + payment methods |
| 2.5 | WhatsApp Gift Flow | ✅ DONE | Buy ticket → share via WhatsApp → auto-assigned to recipient phone |
| 2.6 | P2P Event Credit | ✅ DONE | Wallet top-up via Stripe + send credit to any phone number |
| 2.7 | PayPal Integration | ⏸️ ON HOLD | Requires PayPal business account — enum ready, provider deferred |
| 2.8 | Remittance Partner Links | ✅ DONE | Deep links to WorldRemit, Sendwave, Remitly, Western Union in Wallet page |
| 2.9 | Diaspora Event Discovery | ✅ DONE | Curated "Diaspora Picks" section on Home page with gift CTA |

---

## Phase 3 — Platform Growth

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 3.1 | Full Chapa Integration | ✅ DONE | Chapa wired into payment flow with webhook callback + verification |
| 3.2 | Amharic Language Support (i18n) | ✅ DONE | Translation system (en/am) + language picker in Navbar + 100+ keys |
| 3.3 | Organizer Analytics Dashboard | ✅ DONE | Already existed: revenue, tickets, wallet, CSV exports, attendees |
| 3.4 | Attendee Messaging | ✅ DONE | Organizer can send SMS/WhatsApp/email to all ticket holders |
| 3.5 | Recurring Events | ✅ DONE | RRULE-based with parent/child event linking + auto ticket type copy |
| 3.6 | Event Recommendations | ✅ DONE | Personalized recs based on purchase history + saved events + backfill |
| 3.7 | Multi-Session / Multi-Day Events | ✅ DONE | EventSession model with CRUD endpoints for organizers |

---

## Phase 4 — Differentiation

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 4.1 | Referral / Affiliate System | ✅ DONE | Tracking links with 5% commission, click/conversion tracking, stats dashboard |
| 4.2 | Resale Marketplace | ✅ DONE | Official resale with 150% price cap, 10% platform commission, buyer/seller flow |
| 4.3 | Follow Organizers | ✅ DONE | Follow/unfollow, follower counts, new event notifications to followers |
| 4.4 | Organizer Public Profiles | ✅ DONE | Public profile with upcoming/past events, ratings, social links, banner |
| 4.5 | Presale / Early Access Codes | ✅ DONE | Create/validate presale codes with max uses and time windows |
| 4.6 | Live Check-in Dashboard | ✅ DONE | Real-time check-in stats by ticket type, recent check-ins feed |
| 4.7 | Multiple Images + Video | ✅ DONE | imageGallery JSON array + videoUrl field on Event model |
| 4.8 | Group Tickets / Table Bookings | ✅ DONE | groupDiscountEnabled + groupMinSize + groupDiscountPercent on Event |
| 4.9 | Post-Event Surveys & Ratings | ✅ DONE | 1-5 star ratings with reviews, distribution, anonymous option |
| 4.10 | Donation Integration | ✅ DONE | Per-event donations with goal tracking, progress bar, donor list |
| 4.11 | Fee Absorption Toggle | ✅ DONE | absorbsFees field on Event, organizer toggle endpoint |

---

## Phase 5 — Future / Nice-to-Have

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 5.1 | Telegram Bot | ⬜ TODO | Event discovery, ticket purchase, QR display via Telegram |
| 5.2 | USSD Ticketing | ⬜ TODO | Dial *XXX# to buy tickets — non-smartphone users |
| 5.3 | Interactive Seat Maps | ⬜ TODO | SVG venue maps with click-to-select seats |
| 5.4 | Loyalty / Rewards Program | ⬜ TODO | Points for purchases, redeem for discounts/merch |
| 5.5 | Ticket Insurance | ⬜ TODO | Optional refund protection at checkout |
| 5.6 | Offline QR Scanning | ⬜ TODO | Signed QR codes verifiable without API call |
| 5.7 | Corporate / B2B Invoicing | ⬜ TODO | Invoice-based purchasing, PO numbers, TIN receipts |
| 5.8 | Venue Management Module | ⬜ TODO | Reusable Venue model with maps, capacity, photos |
| 5.9 | Custom Branded Event Pages | ⬜ TODO | Organizer custom colors/branding (premium feature) |
| 5.10 | Public API | ⬜ TODO | API for partners, media sites, tourism platforms |
| 5.11 | Social Sharing (Full) | ⬜ TODO | Facebook/Twitter/Telegram deep links, Open Graph meta |
| 5.12 | Verified Fan / Bot Protection | ⬜ TODO | Queue system for high-demand events |

---

## Status Legend

| Icon | Meaning |
|------|---------|
| ⬜ TODO | Not started |
| 🔨 IN PROGRESS | Currently being implemented |
| ✅ DONE | Implemented and tested |
| ⏸️ ON HOLD | Blocked or deferred |

---

## Notes

- **Total features:** 44
- **Priority order:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
- **Remittance focus:** Phase 2 is the key differentiator for Ethiopian diaspora market
- **Revenue impact:** Stripe + Gift Wallet + Multi-Currency unlock an entirely new revenue stream
