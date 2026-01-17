# PassAddis Platform - Comprehensive TODO List

## Status Legend
- [ ] Not started
- [x] Completed
- [~] In progress

---

## P0 - CRITICAL (Must Fix Immediately)

### Payments & Notifications
- [x] **SMS/Email notifications for ticket transfers** - Recipients now receive transfer codes
  - File: `backend/src/tickets/tickets.service.ts:444`
  - Implemented: SMS sent via AfroSMS when transfer is initiated

- [ ] **Telebirr payment integration** - Currently stubbed with TODOs
  - File: `backend/src/payments/providers/telebirr.provider.ts`
  - Implement: Actual Telebirr API calls

- [ ] **CBE Birr payment integration** - Currently stubbed with TODOs
  - File: `backend/src/payments/providers/cbe-birr.provider.ts`
  - Implement: Actual CBE Birr API calls

- [ ] **Waitlist notifications** - Users never notified when tickets become available
  - File: `backend/src/waitlist/waitlist.service.ts:229`
  - Implement: SMS/email when waitlisted tickets become available

### Shop Owner Flow
- [x] **Shop owner order status updates** - Already implemented with "Mark Ready" and "Complete Pickup" buttons
  - Files: `backend/src/shop-owner/shop-owner.controller.ts`, `web/src/pages/shop-owner/ShopOwnerOrders.tsx`
  - Implemented: Full status workflow with SMS notification when order is ready

---

## P1 - HIGH PRIORITY (Major Features)

### Admin Panel
- [x] **Event approval workflow** - Already implemented
  - File: `backend/src/admin/admin.controller.ts`, `web/src/pages/admin/AdminEvents.tsx`
  - Implemented: Approve, Reject, Feature toggle all working with full UI

- [ ] **Merchant verification** - Can't verify organizers/shop owners
  - File: `backend/src/admin/admin.controller.ts`
  - Implement: verifyOrganizer, approveShopOwner, suspendMerchant endpoints

### Organizer Flow
- [ ] **Event cancellation refunds** - No refunds when organizer cancels event
  - File: `backend/src/organizer/organizer.service.ts:631-635`
  - Implement: Trigger refund flow when organizer cancels event with sold tickets

- [ ] **Profile completion enforcement** - Can create events without complete profile
  - File: `web/src/pages/organizer/OrganizerSettings.tsx`
  - Implement: Block event creation until profile is complete and verified

### Shop Owner Flow
- [ ] **Block unverified shop owners from selling**
  - File: `backend/src/shop-owner/shop-owner.service.ts`
  - Implement: Prevent item creation until merchant status is ACTIVE

### Notifications
- [ ] **Ticket purchase confirmation SMS/email**
  - Implement: Send confirmation when ticket purchase completes

- [ ] **Shop order confirmation SMS/email**
  - Implement: Send confirmation when shop order is placed/paid

### Frontend Navigation
- [ ] **Role-based navbar visibility**
  - File: `web/src/components/layout/Navbar.tsx`
  - Fix: Hide/show menu items based on user role properly

---

## P2 - MEDIUM PRIORITY (Important Features)

### Authentication
- [x] **Password reset flow** - Users can now recover accounts
  - File: `backend/src/auth/auth.service.ts`, `web/src/pages/ForgotPassword.tsx`, `web/src/pages/ResetPassword.tsx`
  - Implemented: forgot-password and reset-password endpoints with frontend pages

- [ ] **Email verification** - No email confirmation for signups
  - File: `backend/src/auth/auth.service.ts:381`
  - Implement: Email verification token flow

### Search & Filters
- [ ] **Shop item search** - No search functionality
  - File: `web/src/pages/Shop.tsx`
  - Implement: Search input and API parameter

- [ ] **Event pagination** - May load all events at once
  - File: `web/src/pages/Events.tsx`
  - Implement: Pagination component with API pagination

### Promo Codes
- [ ] **Apply promo codes at checkout**
  - File: `backend/src/payments/payments.service.ts`
  - Implement: Promo code validation and discount application

### Merchant Features
- [ ] **Settlement/withdrawal requests**
  - File: `backend/src/organizer/organizer.controller.ts`
  - Implement: Request settlement endpoint and admin approval flow

- [ ] **Analytics dashboard for shop owners**
  - File: `backend/src/shop-owner/shop-owner.service.ts`
  - Complete: Detailed analytics with charts and trends

### Refunds
- [ ] **User refund requests**
  - Implement: Allow users to request refunds through UI

### Export Features
- [ ] **Attendee list export for organizers**
  - Implement: CSV export of event attendees

- [ ] **Bulk item upload for shop owners**
  - Implement: CSV import for shop items

### Event Features
- [ ] **Clone/duplicate event**
  - File: `backend/src/organizer/organizer.service.ts`
  - Implement: Clone existing event to create new one

### Admin Tools
- [ ] **User ban/suspend functionality**
  - Implement: Admin can ban/suspend problematic users

- [ ] **Audit trail for sensitive operations**
  - Expand: AuditLog to cover all admin actions

---

## P3 - LOW PRIORITY (Nice to Have)

### UX Enhancements
- [ ] **Social share for events**
  - File: `web/src/pages/EventDetail.tsx`
  - Implement: Share button functionality

- [ ] **Favorites/wishlist system**
  - Implement: Save favorite events/items

- [ ] **Event venue map**
  - File: `web/src/pages/EventDetail.tsx`
  - Implement: Map component showing venue location

### Email Service
- [ ] **Email notifications**
  - Implement: Order confirmations, receipts via email (SendGrid/SES)

### Analytics
- [ ] **Website analytics**
  - Implement: Google Analytics or similar integration

---

## Bug Fixes

### Cart Persistence
- [x] **Save cart to localStorage**
  - File: `web/src/pages/Shop.tsx`
  - Fixed: Cart now persists across page refreshes and syncs with API data

### Stock Validation Edge Case
- [x] **Stock quantity 0 handling**
  - File: `backend/src/shop/shop.service.ts:210-214`
  - Fixed: Added proper stock validation

### Phone Number Handling
- [ ] **Invalid phone for email-only users**
  - File: `backend/src/auth/auth.service.ts:380`
  - Fix: Handle email-only users properly without fake phone numbers

### Service Fee Consistency
- [ ] **Shop order service fees**
  - File: `backend/src/shop/shop.service.ts:238-240`
  - Fix: Apply consistent fee structure across ticket and shop orders

### Ticket Transfer Security
- [ ] **Invalidate old QR on transfer**
  - File: `backend/src/tickets/tickets.service.ts:505-507`
  - Fix: Ensure old QR code is invalidated when transfer is claimed

---

## Technical Debt

### Database
- [ ] **Add database indexes**
  - File: `backend/prisma/schema.prisma`
  - Add: Indexes on Event.merchantId, Order.userId, Order.status, Merchant.userId

### Code Cleanup
- [ ] **Remove legacy Organizer table**
  - Files: `schema.prisma`, `backend/src/organizer/organizer.service.ts`
  - Migrate: All Organizer data to Merchant table

- [ ] **Standardize API responses**
  - File: `web/src/lib/api.ts`
  - Fix: Consistent response shape across all endpoints

- [ ] **Replace `any` types**
  - Multiple files
  - Fix: Add proper TypeScript types

---

## Security

### Webhook Verification
- [ ] **Mandatory Chapa signature verification**
  - File: `backend/src/payments/payments.service.ts:291-301`
  - Fix: Make webhook signature verification required

### Permission Checks
- [ ] **Audit admin endpoints**
  - Files: Multiple admin endpoints
  - Verify: All admin endpoints have proper role guards

---

## Best Practices to Implement (From Eventbrite/DoorDash)

### From Eventbrite
- [ ] Event series (recurring events)
- [ ] Discount codes with usage limits
- [ ] Attendee check-in app/page
- [ ] Event analytics dashboard
- [ ] Custom registration questions
- [ ] Waitlist auto-release

### From DoorDash/UberEats
- [ ] Order tracking real-time updates
- [ ] Pickup time selection
- [ ] Order preparation time estimates
- [ ] Customer reviews for shops
- [ ] Reorder previous orders

### From Shopify
- [ ] Inventory alerts (low stock email)
- [ ] Product variants (sizes, colors)
- [ ] Sales reports and exports
- [ ] Tax calculation
- [ ] Multi-location inventory

---

## Implementation Priority Order

### Phase 1 (Week 1-2) - Critical Fixes
1. SMS notifications for ticket transfers
2. Shop owner order status UI
3. Admin event approval workflow
4. Cart persistence

### Phase 2 (Week 3-4) - Core Features
1. Password reset flow
2. Promo code application
3. Event pagination
4. Shop search
5. Profile completion enforcement

### Phase 3 (Week 5-6) - Merchant Features
1. Settlement requests
2. Attendee export
3. Analytics dashboard
4. Clone events

### Phase 4 (Week 7-8) - Polish
1. Email notifications
2. Social sharing
3. Favorites
4. Maps integration
