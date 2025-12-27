/**
 * PassAddis API Client
 * Centralized API service for all backend communication
 */

// Use relative URL for web (Vercel will proxy to backend)
// Use full URL for native mobile apps
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'web'
  ? '/api'  // Vercel rewrites this to the backend
  : 'http://passaddis-dev-backend-env.eba-bvsaimrn.eu-north-1.elasticbeanstalk.com/api';

// Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  location: string;
  address: string;
  city: string;
  imageUrl: string;
  galleryImages: string[];
  category: string;
  isFeatured: boolean;
  status: string;
  ticketTypes: TicketType[];
  organizer: {
    id: string;
    businessName: string;
    name: string;
    logo?: string;
  };
  minPrice?: number;
  maxPrice?: number;
  ticketsAvailable?: number;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
  available: number;
  maxPerOrder: number;
}

export interface Ticket {
  id: string;
  qrCode: string;
  status: 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED';
  purchasedAt: string;
  event: Event;
  ticketType: TicketType;
}

export interface Order {
  id: string;
  orderNumber: string;
  total: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentMethod?: string;
  createdAt: string;
  tickets: Ticket[];
  event?: Event;
}

export interface PaymentInitiation {
  paymentId: string;
  orderId: string;
  amount: number;
  method: string;
  success: boolean;
  checkout_url: string;
  checkoutUrl: string;
  tx_ref: string;
  txRef: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  eventId?: string;
}

// Paginated response type
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Token storage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Base fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: data?.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

// Auth API
export const authApi = {
  // OTP Authentication
  sendOtp: (phone: string) =>
    apiFetch<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string) =>
    apiFetch<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  // Email/Password Authentication
  register: (email: string, password: string, name: string, phone?: string) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Profile Management
  completeProfile: (name: string, email?: string) =>
    apiFetch<User>('/auth/complete-profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, email }),
    }),

  setPassword: (password: string) =>
    apiFetch<{ message: string }>('/auth/set-password', {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    }),

  hasPassword: () => apiFetch<{ hasPassword: boolean }>('/auth/has-password'),

  getMe: () => apiFetch<User>('/auth/me'),
};

// Events API
export const eventsApi = {
  getAll: async (params?: { category?: string; search?: string; city?: string }): Promise<ApiResponse<Event[]>> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.city) query.append('city', params.city);
    const queryString = query.toString();
    const response = await apiFetch<PaginatedResponse<Event>>(`/events${queryString ? `?${queryString}` : ''}`);
    // Extract just the data array from paginated response
    if (response.data) {
      return { data: response.data.data, status: response.status };
    }
    return { error: response.error, status: response.status };
  },

  getFeatured: () => apiFetch<Event[]>('/events/featured'),

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiFetch<{ category: string; count: number }[]>('/events/categories');
    // Extract just the category names
    if (response.data) {
      return { data: response.data.map(c => c.category), status: response.status };
    }
    return { error: response.error, status: response.status };
  },

  getById: (id: string) => apiFetch<Event>(`/events/${id}`),
};

// Tickets API
export const ticketsApi = {
  purchase: (eventId: string, tickets: { ticketTypeId: string; quantity: number }[]) =>
    apiFetch<{ order: Order; tickets: Ticket[]; paymentRequired: number }>('/tickets/purchase', {
      method: 'POST',
      body: JSON.stringify({ eventId, tickets }),
    }),

  getMyTickets: () => apiFetch<Ticket[]>('/tickets/my-tickets'),

  getTicket: (id: string) => apiFetch<Ticket>(`/tickets/${id}`),

  validate: (qrCode: string) =>
    apiFetch<{ valid: boolean; ticket?: Ticket }>('/tickets/validate', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    }),
};

// Payments API
export const paymentsApi = {
  initiate: (orderId: string, method: 'CHAPA' | 'TELEBIRR' | 'CBE_BIRR' = 'CHAPA') =>
    apiFetch<PaymentInitiation>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ orderId, method }),
    }),

  getStatus: (orderId: string) =>
    apiFetch<{ status: string; paid: boolean }>(`/payments/status/${orderId}`),

  verify: (orderId: string) =>
    apiFetch<{ verified: boolean; status: string; order: { id: string; status: string } }>(`/payments/verify/${orderId}`),
};

// Shop Order type
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

// Shop API
export const shopApi = {
  getItems: (params?: { category?: string; eventId?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.eventId) query.append('eventId', params.eventId);
    const queryString = query.toString();
    return apiFetch<ShopItem[]>(`/shop/items${queryString ? `?${queryString}` : ''}`);
  },

  getItem: (id: string) => apiFetch<ShopItem>(`/shop/items/${id}`),

  getCategories: () => apiFetch<string[]>('/shop/categories'),

  createOrder: (items: Array<{ shopItemId: string; quantity: number }>, pickupLocationId: string) =>
    apiFetch<{ order: ShopOrder; paymentRequired: number }>('/shop/orders', {
      method: 'POST',
      body: JSON.stringify({ items, pickupLocationId }),
    }),

  getMyOrders: () => apiFetch<ShopOrder[]>('/shop/orders'),

  getOrder: (id: string) => apiFetch<ShopOrder>(`/shop/orders/${id}`),
};

// Health check
export const healthCheck = () => apiFetch<{ status: string }>('/health');
