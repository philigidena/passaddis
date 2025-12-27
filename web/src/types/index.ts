// User types
export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ORGANIZER' | 'SHOP_OWNER' | 'ADMIN';
  isVerified?: boolean;
  createdAt?: string;
}

// Merchant/Organizer Profile
export interface MerchantProfile {
  id: string;
  merchantCode: string;
  businessName: string;
  tradeName?: string;
  description?: string;
  logo?: string;
  type: 'ORGANIZER' | 'SHOP' | 'SUPERMARKET' | 'VENDOR';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  isVerified: boolean;
  commissionRate: number;
  city: string;
  user?: User;
}

// Dashboard Stats
export interface AdminDashboardStats {
  users: {
    total: number;
    newThisMonth: number;
    byRole: Record<string, number>;
  };
  events: {
    total: number;
    pending: number;
    published: number;
    thisMonth: number;
  };
  tickets: {
    totalSold: number;
    revenue: number;
    thisMonth: {
      sold: number;
      revenue: number;
    };
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
}

export interface OrganizerDashboardStats {
  profile: {
    id: string;
    businessName: string;
    status: string;
    isVerified: boolean;
    commissionRate: number;
  };
  events: {
    total: number;
    draft: number;
    pending: number;
    approved: number;
    published: number;
    rejected: number;
  };
  tickets: {
    totalSold: number;
    revenue: number;
    thisMonth: {
      sold: number;
      revenue: number;
    };
  };
  wallet: {
    balance: number;
    pendingSettlement: number;
    totalEarnings: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  venue: string;
  address?: string;
  city: string;
  imageUrl?: string;
  category: EventCategory;
  isFeatured: boolean;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  ticketTypes: TicketType[];
  organizer: {
    id: string;
    businessName: string;
    logo?: string;
  };
  minPrice?: number;
  maxPrice?: number;
  ticketsAvailable?: number;
}

export type EventCategory =
  | 'MUSIC'
  | 'SPORTS'
  | 'ARTS'
  | 'COMEDY'
  | 'FESTIVAL'
  | 'CONFERENCE'
  | 'NIGHTLIFE'
  | 'OTHER';

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  available: number;
  maxPerOrder: number;
}

// Ticket types
export interface Ticket {
  id: string;
  qrCode: string;
  qrCodeImage?: string;
  status: 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  usedAt?: string;
  event: Event;
  ticketType: TicketType;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentMethod?: string;
  createdAt: string;
  tickets?: Ticket[];
}

// Payment types
export interface PaymentInitiation {
  paymentId: string;
  orderId: string;
  amount: number;
  method: string;
  success: boolean;
  checkout_url?: string;
  tx_ref?: string;
}

export type PaymentMethod = 'CHAPA' | 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER';

// Shop types
export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: ShopCategory;
  inStock: boolean;
}

export type ShopCategory = 'WATER' | 'DRINKS' | 'SNACKS' | 'MERCH';

export interface ShopOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  qrCode: string | null;
  items: Array<{
    id: string;
    shopItem: ShopItem;
    quantity: number;
    price: number;
  }>;
}

export interface PickupLocation {
  id: string;
  name: string;
  area: string;
  address: string;
  hours: string;
  isActive: boolean;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Cart types
export interface CartItem {
  shopItemId: string;
  shopItem: ShopItem;
  quantity: number;
}

export interface TicketSelection {
  ticketTypeId: string;
  ticketType: TicketType;
  quantity: number;
}
