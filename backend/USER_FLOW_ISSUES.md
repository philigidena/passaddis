# PassAddis User Flow Issues & Fixes

**Date:** January 27, 2026
**Analysis:** Comprehensive review of all user role flows
**Status:** ALL CRITICAL AND HIGH ISSUES FIXED

---

## Executive Summary

Analysis of all user role flows (USER, SHOP_OWNER, ORGANIZER, ADMIN) identified **15 issues** across frontend and backend. All critical and high severity issues have been fixed. Additionally, email verification for new user signups has been implemented.

---

## Fixed Issues

### 1. SHOP_OWNER: Dashboard Shows "Create Profile" After Profile Creation - FIXED

**Status:** FIXED
**Files Modified:**
- `web/src/pages/shop-owner/ShopOwnerDashboard.tsx`

**Fix Applied:**
- Added `merchantStatus` state to track PENDING/ACTIVE/SUSPENDED/BLOCKED
- Added dedicated PENDING view showing "Application Pending Approval"
- Added SUSPENDED/BLOCKED view with contact support option
- Dashboard now properly shows status-appropriate views instead of empty stats

---

### 2. ORGANIZER: No JWT Token Returned After Profile Creation - FIXED

**Status:** FIXED
**Files Modified:**
- `backend/src/organizer/organizer.module.ts` - Added JwtModule import
- `backend/src/organizer/organizer.service.ts` - Added JWT generation in createProfile()

**Fix Applied:**
- Imported JwtService and JwtModule
- createProfile() now returns accessToken and user data like shop-owner.service.ts

---

### 3. SHOP_OWNER: cancelOrder() Authorization Bug - FIXED

**Status:** FIXED
**Files Modified:**
- `backend/src/shop-owner/shop-owner.service.ts`

**Fix Applied:**
- Changed authorization check from `order.userId !== userId` to `order.merchantId !== merchant.id`
- Now correctly checks if the shop owner owns the order via their merchant profile

---

### 4. ORGANIZER Dashboard: Checks isVerified but Not Status - FIXED

**Status:** FIXED
**Files Modified:**
- `web/src/pages/organizer/OrganizerDashboard.tsx`

**Fix Applied:**
- Added `merchantStatus` state
- Added PENDING view with "Application Pending Approval" message
- Added SUSPENDED/BLOCKED view
- Updated status banner to only show for ACTIVE but unverified merchants

---

### 5. OrganizerSettings: Doesn't Handle JWT Response - FIXED

**Status:** FIXED
**Files Modified:**
- `web/src/pages/organizer/OrganizerSettings.tsx`

**Fix Applied:**
- Added JWT token handling in handleSave()
- Stores new token in localStorage
- Updates auth context via refreshUser()

---

### 6. Event Cancellation: Placeholder Wallet Values - FIXED

**Status:** FIXED
**Files Modified:**
- `backend/src/organizer/organizer.service.ts`

**Fix Applied:**
- Added wallet balance calculation before creating refund transactions
- balanceBefore and balanceAfter are now properly calculated

---

### 7. Email Verification for New User Signups - NEW FEATURE

**Status:** IMPLEMENTED
**Files Modified:**
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.controller.ts`

**Features Added:**
- New users are created with `isVerified: false` and `emailVerified: false`
- Verification email sent on registration with 24-hour expiry token
- New endpoint: `GET /auth/verify-email?token=xxx`
- New endpoint: `POST /auth/resend-verification`
- Welcome email sent after successful verification

---

### 8. JWT Expiry Consistency - FIXED

**Status:** FIXED
**Files Modified:**
- `backend/src/shop-owner/shop-owner.module.ts`
- `backend/src/organizer/organizer.module.ts`

**Fix Applied:**
- Both modules now use `JWT_EXPIRES_IN` from config (default: 7d)
- Removed hardcoded '15m' expiry

---

## Remaining Issues (Low Priority)

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 7 | PENDING merchants can create events | LOW | Intentional - they can draft |
| 8 | PENDING shop owners can create items | LOW | Intentional - they can prepare |
| 9 | Inconsistent error handling | LOW | Deferred |
| 10 | Admin pending count filter | LOW | To verify |
| 12 | No email on approval | LOW | Future enhancement |
| 13 | Inconsistent getProfile behavior | LOW | Deferred |

---

## Summary of Changes

### Backend Files Modified:
1. `src/organizer/organizer.module.ts` - Added JwtModule
2. `src/organizer/organizer.service.ts` - JWT in createProfile, wallet balance calc
3. `src/shop-owner/shop-owner.module.ts` - JWT expiry from config
4. `src/shop-owner/shop-owner.service.ts` - Fixed cancelOrder auth
5. `src/auth/auth.service.ts` - Email verification flow
6. `src/auth/auth.controller.ts` - Verification endpoints

### Frontend Files Modified:
1. `web/src/pages/shop-owner/ShopOwnerDashboard.tsx` - PENDING/SUSPENDED views
2. `web/src/pages/organizer/OrganizerDashboard.tsx` - PENDING/SUSPENDED views
3. `web/src/pages/organizer/OrganizerSettings.tsx` - JWT handling

---

## Validation

All changes validated:
```bash
# Backend
cd backend && npx tsc --noEmit  # No errors

# Frontend
cd web && npx tsc --noEmit  # No errors
```

---

*Document updated after implementing all fixes.*
