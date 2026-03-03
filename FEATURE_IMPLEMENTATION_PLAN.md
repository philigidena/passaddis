# PassAddis Feature Implementation Plan

This document outlines the comprehensive implementation plan for new features inspired by TicketSource, tailored for the Ethiopian market (software-only, QR-based, Telebirr/local payments).

---

## Table of Contents

1. [Phase 1: Core Improvements](#phase-1-core-improvements)
2. [Phase 2: Sales & Marketing](#phase-2-sales--marketing)
3. [Phase 3: User Experience](#phase-3-user-experience)
4. [Phase 4: Polish & Extras](#phase-4-polish--extras)
5. [Database Schema Changes](#database-schema-changes)
6. [API Endpoints Summary](#api-endpoints-summary)
7. [Frontend Components](#frontend-components)

---

## Phase 1: Core Improvements

### 1.1 Real-Time Scan Dashboard

**Priority:** HIGH
**Effort:** Medium
**Impact:** High

#### Description
A live dashboard for organizers to monitor event entry in real-time during events.

#### Features
- Live attendance counter (checked-in vs total tickets)
- Check-in rate percentage
- Entry time distribution graph
- Recent scans feed (last 20 scans)
- Scanner device status
- Gate/zone breakdown

#### Technical Implementation

**Backend:**
```typescript
// New WebSocket gateway
// File: backend/src/scan/scan.gateway.ts

@WebSocketGateway({ namespace: 'scan' })
export class ScanGateway {
  @SubscribeMessage('join-event')
  handleJoinEvent(client: Socket, eventId: string) {
    client.join(`event-${eventId}`);
  }

  broadcastScan(eventId: string, scanData: ScanEvent) {
    this.server.to(`event-${eventId}`).emit('new-scan', scanData);
  }

  broadcastStats(eventId: string, stats: ScanStats) {
    this.server.to(`event-${eventId}`).emit('stats-update', stats);
  }
}
```

**New Endpoints:**
```
GET  /api/scan/live/:eventId      - Get current scan stats
GET  /api/scan/history/:eventId   - Get scan history
POST /api/scan/validate           - Validate ticket (existing, add WebSocket emit)
WS   /scan                        - WebSocket for real-time updates
```

**Database Changes:**
```prisma
model ScanEvent {
  id          String   @id @default(uuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id])
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id])
  deviceId    String?  // Scanner device identifier
  deviceName  String?  // "John's iPhone", "Gate A Scanner"
  gate        String?  // "Main Entrance", "VIP Gate"
  scannedBy   String?  // Staff user ID
  scannedAt   DateTime @default(now())

  @@index([eventId, scannedAt])
}
```

**Frontend Components:**
- `ScanDashboard.tsx` - Main dashboard page
- `LiveCounter.tsx` - Animated attendance counter
- `ScanFeed.tsx` - Real-time scan list
- `EntryChart.tsx` - Entry time distribution chart

---

### 1.2 Offline Scanning Mode

**Priority:** HIGH
**Effort:** Medium
**Impact:** High

#### Description
Allow ticket scanning without internet connection - critical for Ethiopian venues where connectivity is unreliable.

#### Features
- Pre-download ticket data before event
- Scan tickets offline with local validation
- Queue scans for sync when online
- Visual indicator of offline/online status
- Conflict resolution for duplicate scans

#### Technical Implementation

**Mobile App (React Native):**
```typescript
// File: frontend/services/offlineScan.ts

interface CachedTicket {
  id: string;
  qrCode: string;
  status: 'VALID' | 'USED';
  ticketType: string;
  holderName?: string;
}

class OfflineScanService {
  private db: SQLite.Database;
  private syncQueue: ScanEvent[] = [];

  async downloadEventTickets(eventId: string): Promise<number> {
    const tickets = await api.get(`/scan/download/${eventId}`);
    await this.db.executeSql(
      'INSERT INTO cached_tickets VALUES ?',
      [tickets]
    );
    return tickets.length;
  }

  async validateOffline(qrCode: string): Promise<ValidationResult> {
    const ticket = await this.db.executeSql(
      'SELECT * FROM cached_tickets WHERE qrCode = ?',
      [qrCode]
    );

    if (!ticket) return { valid: false, reason: 'NOT_FOUND' };
    if (ticket.status === 'USED') return { valid: false, reason: 'ALREADY_USED' };

    // Mark as used locally
    await this.db.executeSql(
      'UPDATE cached_tickets SET status = "USED" WHERE id = ?',
      [ticket.id]
    );

    // Queue for server sync
    this.syncQueue.push({
      ticketId: ticket.id,
      scannedAt: new Date().toISOString(),
      offline: true
    });

    return { valid: true, ticket };
  }

  async syncWithServer(): Promise<SyncResult> {
    const results = await api.post('/scan/sync', { scans: this.syncQueue });
    this.syncQueue = [];
    return results;
  }
}
```

**New Endpoints:**
```
GET  /api/scan/download/:eventId  - Download all tickets for offline use
POST /api/scan/sync               - Sync offline scans to server
```

---

### 1.3 Comprehensive Reports & Analytics

**Priority:** HIGH
**Effort:** Medium
**Impact:** High

#### Description
Detailed reporting dashboard for organizers with export capabilities.

#### Features
- Sales dashboard (revenue, tickets sold, trends)
- Attendance reports (check-in rate, no-shows)
- Financial reports (gross, fees, net)
- Export to CSV/Excel
- Date range filtering
- Comparison with previous events

#### Technical Implementation

**New Endpoints:**
```
GET /api/reports/sales/:eventId
    ?startDate=2024-01-01
    &endDate=2024-01-31
    &groupBy=day|week|month

GET /api/reports/attendance/:eventId

GET /api/reports/financial/:eventId

GET /api/reports/export/:eventId
    ?type=sales|attendance|financial
    &format=csv|xlsx|pdf
```

**Response Example (Sales Report):**
```json
{
  "summary": {
    "totalRevenue": 150000,
    "totalTickets": 500,
    "averageOrderValue": 300,
    "conversionRate": 0.12
  },
  "byTicketType": [
    { "name": "VIP", "sold": 50, "revenue": 50000 },
    { "name": "Regular", "sold": 450, "revenue": 100000 }
  ],
  "timeline": [
    { "date": "2024-01-15", "tickets": 100, "revenue": 30000 },
    { "date": "2024-01-16", "tickets": 150, "revenue": 45000 }
  ],
  "salesByChannel": {
    "online": { "tickets": 480, "revenue": 144000 },
    "boxOffice": { "tickets": 20, "revenue": 6000 }
  }
}
```

**Export Service:**
```typescript
// File: backend/src/reports/export.service.ts

@Injectable()
export class ExportService {
  async exportToCSV(data: any[], filename: string): Promise<Buffer> {
    const csv = Papa.unparse(data);
    return Buffer.from(csv, 'utf-8');
  }

  async exportToExcel(data: any[], filename: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    // Add headers and data
    return workbook.xlsx.writeBuffer();
  }

  async exportToPDF(data: ReportData, template: string): Promise<Buffer> {
    // Use puppeteer or pdfkit
  }
}
```

---

### 1.4 Event Cloning & Templates

**Priority:** HIGH
**Effort:** Low
**Impact:** High

#### Description
Allow organizers to quickly create events by cloning existing ones or using templates.

#### Features
- Clone any existing event
- Save events as reusable templates
- Template library for organizers
- Bulk date selection for recurring events

#### Technical Implementation

**New Endpoints:**
```
POST /api/organizer/events/:id/clone
     Body: { newDate: "2024-02-15", newTitle?: "Event Name v2" }

POST /api/organizer/templates
     Body: { name: "Weekly Party", eventId: "..." }

GET  /api/organizer/templates

POST /api/organizer/events/from-template/:templateId
     Body: { date: "2024-02-15", title: "..." }

DELETE /api/organizer/templates/:id
```

**Database Changes:**
```prisma
model EventTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?

  // Stored event configuration
  config      Json     // { title, description, venue, ticketTypes, etc. }

  organizerId String
  organizer   User     @relation(fields: [organizerId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([organizerId])
}
```

**Clone Service:**
```typescript
async cloneEvent(eventId: string, newDate: Date, newTitle?: string): Promise<Event> {
  const original = await this.prisma.event.findUnique({
    where: { id: eventId },
    include: { ticketTypes: true }
  });

  const cloned = await this.prisma.event.create({
    data: {
      ...original,
      id: undefined,
      title: newTitle || `${original.title} (Copy)`,
      date: newDate,
      status: 'DRAFT',
      createdAt: undefined,
      ticketTypes: {
        create: original.ticketTypes.map(tt => ({
          ...tt,
          id: undefined,
          sold: 0
        }))
      }
    }
  });

  return cloned;
}
```

---

### 1.5 WhatsApp Integration

**Priority:** HIGH
**Effort:** Low
**Impact:** High

#### Description
Deep WhatsApp integration for sharing and notifications - essential for Ethiopian market.

#### Features
- Share ticket via WhatsApp (one-click)
- Share event via WhatsApp
- WhatsApp click-to-chat for support
- Ticket transfer via WhatsApp message

#### Technical Implementation

**Frontend Helpers:**
```typescript
// File: frontend/utils/whatsapp.ts

export const shareViaWhatsApp = {
  ticket: (ticket: Ticket, event: Event) => {
    const message = encodeURIComponent(
      `🎫 My ticket for ${event.title}\n` +
      `📅 ${formatDate(event.date)}\n` +
      `📍 ${event.venue}\n\n` +
      `Ticket #${ticket.id.slice(-8)}\n` +
      `${window.location.origin}/tickets/${ticket.id}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  },

  event: (event: Event) => {
    const message = encodeURIComponent(
      `Check out this event! 🎉\n\n` +
      `${event.title}\n` +
      `📅 ${formatDate(event.date)}\n` +
      `📍 ${event.venue}\n\n` +
      `Get tickets: ${window.location.origin}/events/${event.id}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  },

  transferCode: (code: string, recipientPhone: string) => {
    const message = encodeURIComponent(
      `🎫 You've received a ticket transfer!\n\n` +
      `Use this code to claim your ticket: ${code}\n\n` +
      `Claim at: ${window.location.origin}/tickets/claim`
    );
    const phone = recipientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }
};
```

**UI Components:**
```tsx
// WhatsApp Share Button
<Button
  onClick={() => shareViaWhatsApp.event(event)}
  className="bg-green-500 hover:bg-green-600"
>
  <WhatsAppIcon /> Share on WhatsApp
</Button>
```

---

## Phase 2: Sales & Marketing

### 2.1 Digital Box Office

**Priority:** HIGH
**Effort:** Medium
**Impact:** High

#### Description
Web-based point-of-sale for walk-up ticket sales at venues.

#### Features
- Staff login with box office role
- Sell tickets on behalf of customers
- Multiple payment methods (Telebirr QR, cash)
- Complimentary ticket issuance
- Daily sales reconciliation
- Receipt generation (SMS/print)

#### Technical Implementation

**New Role:**
```prisma
enum Role {
  USER
  ORGANIZER
  SHOP_OWNER
  BOX_OFFICE  // NEW
  ADMIN
}
```

**New Endpoints:**
```
POST /api/box-office/sell
     Body: {
       eventId: string,
       ticketTypeId: string,
       quantity: number,
       customerPhone: string,
       paymentMethod: 'TELEBIRR' | 'CASH' | 'COMP',
       staffNotes?: string
     }

POST /api/box-office/comp
     Body: {
       eventId: string,
       ticketTypeId: string,
       quantity: number,
       recipientName: string,
       recipientPhone: string,
       reason: string  // "VIP Guest", "Press", "Sponsor"
     }

GET  /api/box-office/session
     // Returns today's sales for current staff

POST /api/box-office/reconcile
     Body: { cashAmount: number, notes?: string }
```

**Database Changes:**
```prisma
model BoxOfficeSale {
  id            String   @id @default(uuid())

  eventId       String
  event         Event    @relation(fields: [eventId], references: [id])

  ticketTypeId  String
  ticketType    TicketType @relation(fields: [ticketTypeId], references: [id])

  quantity      Int
  unitPrice     Float
  totalAmount   Float

  paymentMethod String   // TELEBIRR, CASH, COMP
  paymentRef    String?  // Telebirr ref or cash receipt number

  customerPhone String
  customerName  String?

  staffId       String
  staff         User     @relation(fields: [staffId], references: [id])

  isComp        Boolean  @default(false)
  compReason    String?

  tickets       Ticket[]

  createdAt     DateTime @default(now())

  @@index([eventId, createdAt])
  @@index([staffId, createdAt])
}
```

---

### 2.2 Early Bird & Timed Pricing

**Priority:** MEDIUM
**Effort:** Low
**Impact:** Medium

#### Description
Automatic price changes based on date or quantity sold.

#### Features
- Multiple pricing phases per ticket type
- Date-based switching (early bird ends on X date)
- Quantity-based switching (first 100 at lower price)
- Countdown display for urgency
- Price history for reports

#### Technical Implementation

**Database Changes:**
```prisma
model PricingTier {
  id            String   @id @default(uuid())

  ticketTypeId  String
  ticketType    TicketType @relation(fields: [ticketTypeId], references: [id])

  name          String   // "Early Bird", "Regular", "Last Minute"
  price         Float

  // Activation rules (one or both)
  startsAt      DateTime?
  endsAt        DateTime?
  maxQuantity   Int?     // First X tickets at this price

  isActive      Boolean  @default(true)
  priority      Int      @default(0)  // Higher = checked first

  @@index([ticketTypeId])
}
```

**Price Resolution Logic:**
```typescript
async getCurrentPrice(ticketTypeId: string): Promise<{ price: number; tier: string }> {
  const tiers = await this.prisma.pricingTier.findMany({
    where: { ticketTypeId, isActive: true },
    orderBy: { priority: 'desc' }
  });

  const ticketType = await this.prisma.ticketType.findUnique({
    where: { id: ticketTypeId }
  });

  const now = new Date();

  for (const tier of tiers) {
    // Check date constraints
    if (tier.startsAt && now < tier.startsAt) continue;
    if (tier.endsAt && now > tier.endsAt) continue;

    // Check quantity constraints
    if (tier.maxQuantity && ticketType.sold >= tier.maxQuantity) continue;

    return { price: tier.price, tier: tier.name };
  }

  // Fallback to base price
  return { price: ticketType.price, tier: 'Standard' };
}
```

---

### 2.3 Enhanced Promo Codes

**Priority:** MEDIUM
**Effort:** Low
**Impact:** Medium

#### Description
More powerful promotional code system.

#### Features
- Bulk code generation
- Per-promoter tracking
- First-time buyer codes
- Usage analytics
- Affiliate commission tracking

#### Technical Implementation

**Database Changes:**
```prisma
model PromoCode {
  // Existing fields...

  // NEW fields
  codePrefix    String?  // For bulk generation: "SUMMER" -> SUMMER001, SUMMER002
  bulkQuantity  Int?     // How many codes in this batch

  // Targeting
  firstTimeOnly Boolean  @default(false)
  specificTicketTypes String[]  // Empty = all types

  // Affiliate tracking
  affiliateId   String?
  affiliate     Affiliate? @relation(fields: [affiliateId], references: [id])

  // Analytics
  totalRevenue  Float    @default(0)  // Revenue from orders using this code
}

model Affiliate {
  id              String   @id @default(uuid())

  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])

  code            String   @unique  // Their unique referral code
  commissionRate  Float    @default(5)  // Percentage

  totalSales      Float    @default(0)
  totalCommission Float    @default(0)
  pendingPayout   Float    @default(0)

  promoCodes      PromoCode[]
  payouts         AffiliatePayout[]

  createdAt       DateTime @default(now())
}
```

**Bulk Generation Endpoint:**
```
POST /api/admin/promo/generate-bulk
     Body: {
       prefix: "SUMMER",
       quantity: 100,
       discountType: "PERCENTAGE",
       discountValue: 10,
       maxUsesPerCode: 1,
       validUntil: "2024-08-31"
     }

Response: {
  codes: ["SUMMER001", "SUMMER002", ...],
  downloadUrl: "/api/admin/promo/download/batch-123"
}
```

---

### 2.4 Group Bookings & Discounts

**Priority:** MEDIUM
**Effort:** Low
**Impact:** Medium

#### Description
Support for group purchases with automatic discounts.

#### Features
- Group discount rules (buy 5+, get 10% off)
- Attendee name collection
- Group leader designation
- Corporate invoice generation
- Bulk ticket management

#### Technical Implementation

**Database Changes:**
```prisma
model GroupDiscount {
  id            String   @id @default(uuid())

  eventId       String
  event         Event    @relation(fields: [eventId], references: [id])

  minQuantity   Int      // Minimum tickets for discount
  discountType  String   // PERCENTAGE, FIXED_PER_TICKET
  discountValue Float

  maxQuantity   Int?     // Optional cap

  isActive      Boolean  @default(true)
}

model GroupBooking {
  id            String   @id @default(uuid())

  orderId       String   @unique
  order         Order    @relation(fields: [orderId], references: [id])

  groupName     String?  // "ABC Company"
  leaderName    String
  leaderEmail   String?
  leaderPhone   String

  attendees     GroupAttendee[]

  invoiceNumber String?
  invoiceUrl    String?
}

model GroupAttendee {
  id              String   @id @default(uuid())

  groupBookingId  String
  groupBooking    GroupBooking @relation(fields: [groupBookingId], references: [id])

  ticketId        String   @unique
  ticket          Ticket   @relation(fields: [ticketId], references: [id])

  name            String
  email           String?
  phone           String?
}
```

---

## Phase 3: User Experience

### 3.1 Custom Registration Questions

**Priority:** MEDIUM
**Effort:** Medium
**Impact:** Medium

#### Description
Allow organizers to collect additional information during ticket purchase.

#### Features
- Multiple question types (text, select, checkbox, date)
- Per-ticket vs per-order questions
- Required/optional settings
- Response export
- Conditional logic (future)

#### Technical Implementation

**Database Changes:**
```prisma
enum QuestionType {
  TEXT
  TEXTAREA
  SELECT
  MULTISELECT
  CHECKBOX
  DATE
  PHONE
  EMAIL
}

model RegistrationQuestion {
  id            String       @id @default(uuid())

  eventId       String
  event         Event        @relation(fields: [eventId], references: [id])

  question      String
  type          QuestionType
  options       String[]     // For SELECT/MULTISELECT

  required      Boolean      @default(false)
  perTicket     Boolean      @default(false)  // true = ask for each ticket

  order         Int          @default(0)
  isActive      Boolean      @default(true)

  responses     QuestionResponse[]

  @@index([eventId])
}

model QuestionResponse {
  id          String   @id @default(uuid())

  questionId  String
  question    RegistrationQuestion @relation(fields: [questionId], references: [id])

  orderId     String?
  order       Order?   @relation(fields: [orderId], references: [id])

  ticketId    String?
  ticket      Ticket?  @relation(fields: [ticketId], references: [id])

  response    String   // JSON for multi-value responses

  createdAt   DateTime @default(now())
}
```

**Form Builder Component:**
```tsx
// File: web/src/components/organizer/QuestionBuilder.tsx

interface QuestionBuilderProps {
  eventId: string;
  questions: RegistrationQuestion[];
  onSave: (questions: RegistrationQuestion[]) => void;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({ ... }) => {
  // Drag-and-drop question ordering
  // Add/edit/delete questions
  // Preview mode
};
```

---

### 3.2 Smart Waitlist

**Priority:** MEDIUM
**Effort:** Low
**Impact:** Medium

#### Description
Enhanced waitlist with automatic notifications and fair queuing.

#### Features
- Automatic SMS when tickets available
- Position in queue display
- Time-limited purchase window
- Cancelled tickets flow to waitlist
- Analytics for organizers

#### Technical Implementation

**Enhanced Waitlist Model:**
```prisma
model Waitlist {
  id            String   @id @default(uuid())

  eventId       String
  event         Event    @relation(fields: [eventId], references: [id])

  ticketTypeId  String?  // Specific type or any
  ticketType    TicketType? @relation(fields: [ticketTypeId], references: [id])

  userId        String?
  user          User?    @relation(fields: [userId], references: [id])

  email         String
  phone         String

  position      Int      // Queue position

  // Notification tracking
  notified      Boolean  @default(false)
  notifiedAt    DateTime?

  // Purchase window
  offerExpiresAt DateTime?
  offerAccepted  Boolean?

  joinedAt      DateTime @default(now())

  @@unique([eventId, email])
  @@index([eventId, position])
}
```

**Auto-Notification Service:**
```typescript
@Injectable()
export class WaitlistService {
  @Cron('*/5 * * * *')  // Every 5 minutes
  async processWaitlists() {
    // Find events with available tickets and waitlist entries
    const events = await this.findEventsWithAvailability();

    for (const event of events) {
      const available = await this.getAvailableCount(event.id);
      const waitlist = await this.getNextInQueue(event.id, available);

      for (const entry of waitlist) {
        await this.sendOffer(entry);
      }
    }
  }

  async sendOffer(entry: Waitlist) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.waitlist.update({
      where: { id: entry.id },
      data: { notified: true, notifiedAt: new Date(), offerExpiresAt: expiresAt }
    });

    await this.smsService.send(entry.phone,
      `Good news! Tickets are available for ${entry.event.title}. ` +
      `You have 24 hours to purchase. ${this.getPurchaseLink(entry)}`
    );
  }
}
```

---

### 3.3 Event Page Enhancements

**Priority:** MEDIUM
**Effort:** Medium
**Impact:** Medium

#### Description
Richer event pages with more information and social proof.

#### Features
- Photo gallery
- Event schedule/agenda
- Venue map integration
- Organizer profile section
- Social proof ("X people going")
- FAQ section

#### Technical Implementation

**Database Changes:**
```prisma
model Event {
  // Existing fields...

  // NEW fields
  gallery       String[]    // Array of image URLs

  schedule      Json?       // [{ time: "18:00", title: "Doors Open" }, ...]

  faq           Json?       // [{ question: "...", answer: "..." }, ...]

  // Social proof
  viewCount     Int         @default(0)
  shareCount    Int         @default(0)
}

model EventUpdate {
  id        String   @id @default(uuid())

  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])

  title     String
  content   String

  // Notify ticket holders?
  notified  Boolean  @default(false)

  createdAt DateTime @default(now())
}
```

**Frontend Components:**
```tsx
// Event page sections
<EventHero event={event} />
<EventDetails event={event} />
<EventSchedule schedule={event.schedule} />
<EventGallery images={event.gallery} />
<EventOrganizer organizer={event.organizer} />
<EventFAQ faq={event.faq} />
<EventLocation venue={event.venue} address={event.address} />
<SocialProof
  ticketsSold={event.ticketsSold}
  viewCount={event.viewCount}
/>
```

---

### 3.4 Notification System

**Priority:** MEDIUM
**Effort:** Medium
**Impact:** High

#### Description
Comprehensive notification system across multiple channels.

#### Features
- SMS notifications (purchase, reminder, updates)
- Email notifications
- Push notifications (mobile)
- In-app notification center
- Notification preferences

#### Technical Implementation

**Database Changes:**
```prisma
enum NotificationType {
  PURCHASE_CONFIRMATION
  EVENT_REMINDER_24H
  EVENT_REMINDER_2H
  EVENT_UPDATE
  EVENT_CANCELLED
  TICKET_TRANSFER
  WAITLIST_AVAILABLE
  PROMO_OFFER
}

model Notification {
  id          String           @id @default(uuid())

  userId      String
  user        User             @relation(fields: [userId], references: [id])

  type        NotificationType
  title       String
  body        String
  data        Json?            // Additional data (eventId, ticketId, etc.)

  read        Boolean          @default(false)
  readAt      DateTime?

  // Delivery tracking
  sentVia     String[]         // ['SMS', 'EMAIL', 'PUSH']
  smsStatus   String?
  emailStatus String?
  pushStatus  String?

  createdAt   DateTime         @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}

model NotificationPreference {
  id          String   @id @default(uuid())

  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])

  // Channel preferences
  smsEnabled    Boolean @default(true)
  emailEnabled  Boolean @default(true)
  pushEnabled   Boolean @default(true)

  // Type preferences
  reminders     Boolean @default(true)
  updates       Boolean @default(true)
  marketing     Boolean @default(false)
}
```

**Notification Service:**
```typescript
@Injectable()
export class NotificationService {
  async send(
    userId: string,
    type: NotificationType,
    data: NotificationData
  ) {
    const user = await this.getUser(userId);
    const prefs = await this.getPreferences(userId);

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title: this.getTitle(type, data),
        body: this.getBody(type, data),
        data
      }
    });

    const channels = [];

    if (prefs.smsEnabled && user.phone) {
      channels.push(this.sendSMS(user.phone, notification));
    }

    if (prefs.emailEnabled && user.email) {
      channels.push(this.sendEmail(user.email, notification));
    }

    if (prefs.pushEnabled) {
      channels.push(this.sendPush(userId, notification));
    }

    await Promise.all(channels);
  }

  // Scheduled reminders
  @Cron('0 * * * *')  // Every hour
  async sendEventReminders() {
    const in24Hours = await this.getEventsStartingIn(24);
    const in2Hours = await this.getEventsStartingIn(2);

    for (const event of in24Hours) {
      await this.notifyTicketHolders(event, 'EVENT_REMINDER_24H');
    }

    for (const event of in2Hours) {
      await this.notifyTicketHolders(event, 'EVENT_REMINDER_2H');
    }
  }
}
```

---

## Phase 4: Polish & Extras

### 4.1 Partial Refunds

**Priority:** LOW
**Effort:** Low
**Impact:** Low

#### Features
- Refund individual tickets from an order
- Refund partial amounts
- Admin approval workflow
- Automatic credit note option

---

### 4.2 Credit/Voucher System

**Priority:** LOW
**Effort:** Medium
**Impact:** Low

#### Features
- Issue credit on cancellation
- Gift vouchers/cards
- Balance tracking
- Redemption at checkout
- Expiration management

---

### 4.3 Section-Based Tickets

**Priority:** LOW
**Effort:** Medium
**Impact:** Medium

#### Features
- Simple section selection (not full seating charts)
- VIP, Regular, Standing sections
- Visual section picker
- Capacity per section

---

### 4.4 Organizer Verification & Badges

**Priority:** LOW
**Effort:** Low
**Impact:** Medium

#### Features
- Verification levels (Basic, Business, Premium)
- Badge display on events
- Trust indicators
- Priority support

---

## Database Schema Changes

### Summary of New Models

```prisma
// Add to existing schema.prisma

// Phase 1
model ScanEvent { ... }
model EventTemplate { ... }

// Phase 2
model PricingTier { ... }
model BoxOfficeSale { ... }
model GroupDiscount { ... }
model GroupBooking { ... }
model GroupAttendee { ... }
model Affiliate { ... }
model AffiliatePayout { ... }

// Phase 3
model RegistrationQuestion { ... }
model QuestionResponse { ... }
model EventUpdate { ... }
model Notification { ... }
model NotificationPreference { ... }

// Phase 4
model CreditNote { ... }
model VenueSection { ... }
```

---

## API Endpoints Summary

### Phase 1 Endpoints
```
# Scan Dashboard
GET  /api/scan/live/:eventId
GET  /api/scan/history/:eventId
GET  /api/scan/download/:eventId
POST /api/scan/sync
WS   /scan

# Reports
GET  /api/reports/sales/:eventId
GET  /api/reports/attendance/:eventId
GET  /api/reports/financial/:eventId
GET  /api/reports/export/:eventId

# Templates
POST /api/organizer/events/:id/clone
GET  /api/organizer/templates
POST /api/organizer/templates
POST /api/organizer/events/from-template/:id
DELETE /api/organizer/templates/:id
```

### Phase 2 Endpoints
```
# Box Office
POST /api/box-office/sell
POST /api/box-office/comp
GET  /api/box-office/session
POST /api/box-office/reconcile

# Pricing Tiers
GET  /api/organizer/events/:id/pricing-tiers
POST /api/organizer/events/:id/pricing-tiers
PATCH /api/organizer/events/:id/pricing-tiers/:tierId
DELETE /api/organizer/events/:id/pricing-tiers/:tierId

# Bulk Promo
POST /api/admin/promo/generate-bulk
GET  /api/admin/promo/download/:batchId

# Groups
GET  /api/events/:id/group-discounts
POST /api/orders/:id/group-details
```

### Phase 3 Endpoints
```
# Registration Questions
GET  /api/organizer/events/:id/questions
POST /api/organizer/events/:id/questions
PATCH /api/organizer/events/:id/questions/:qId
DELETE /api/organizer/events/:id/questions/:qId
GET  /api/organizer/events/:id/responses/export

# Waitlist
POST /api/waitlist/:eventId/offer
GET  /api/waitlist/:eventId/queue

# Notifications
GET  /api/notifications
PATCH /api/notifications/:id/read
POST /api/notifications/read-all
GET  /api/notifications/preferences
PATCH /api/notifications/preferences
```

---

## Frontend Components

### New Pages
- `/organizer/scan-dashboard` - Real-time scan monitoring
- `/organizer/reports` - Reports and analytics
- `/organizer/templates` - Event templates
- `/organizer/box-office` - Walk-up sales
- `/notifications` - Notification center
- `/admin/affiliates` - Affiliate management

### New Components
- `ScanDashboard.tsx`
- `LiveCounter.tsx`
- `ReportChart.tsx`
- `ExportButton.tsx`
- `TemplateCard.tsx`
- `BoxOfficePanel.tsx`
- `PricingTierEditor.tsx`
- `QuestionBuilder.tsx`
- `NotificationCenter.tsx`
- `WhatsAppShareButton.tsx`

---

## Implementation Order

### Week 1-2
1. Event Cloning & Templates (Low effort, high impact)
2. WhatsApp Integration (Low effort, high impact)
3. CSV/Excel Export (Low effort, high impact)

### Week 3-4
4. Real-Time Scan Dashboard (Medium effort, high impact)
5. Early Bird Pricing (Low effort, medium impact)

### Week 5-6
6. Box Office System (Medium effort, high impact)
7. Reports Dashboard (Medium effort, high impact)

### Week 7-8
8. Offline Scanning (Medium effort, high impact)
9. Enhanced Promo Codes (Low effort, medium impact)

### Week 9-10
10. Notification System (Medium effort, high impact)
11. Custom Registration Questions (Medium effort, medium impact)

### Week 11-12
12. Smart Waitlist (Low effort, medium impact)
13. Group Bookings (Low effort, medium impact)
14. Event Page Enhancements (Medium effort, medium impact)

---

## Notes

- All features are software-only (no hardware dependencies)
- Designed for Ethiopian market (WhatsApp, SMS, local payments)
- Mobile-first approach
- Offline capability where critical
- QR-based scanning only

---

*Document created: February 2026*
*Last updated: February 2026*
