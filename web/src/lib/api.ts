import axios, { type AxiosError, type AxiosInstance } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  User,
  Event,
  Ticket,
  Order,
  PaymentInitiation,
  PaymentMethod,
  ShopItem,
  ShopOrder,
  PickupLocation,
  PaginatedResponse,
  AdminDashboardStats,
  OrganizerDashboardStats,
  MerchantProfile,
} from '@/types';

// API base URL - uses Vite proxy in development
const API_BASE_URL = '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = localStorage.getItem('passaddis_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('passaddis_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('passaddis_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => authToken;

// Initialize token from storage
if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      setAuthToken(null);
      localStorage.removeItem('passaddis_user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Helper to handle API responses
async function handleResponse<T>(promise: Promise<any>): Promise<ApiResponse<T>> {
  try {
    const response = await promise;
    return { data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      error: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      status: axiosError.response?.status || 0,
    };
  }
}

// ============== AUTH API ==============
export const authApi = {
  sendOtp: (phone: string) =>
    handleResponse<{ message: string }>(api.post('/auth/send-otp', { phone })),

  verifyOtp: (phone: string, code: string) =>
    handleResponse<AuthResponse>(api.post('/auth/verify-otp', { phone, code })),

  register: (email: string, password: string, name: string, phone?: string) =>
    handleResponse<AuthResponse>(api.post('/auth/register', { email, password, name, phone })),

  login: (email: string, password: string) =>
    handleResponse<AuthResponse>(api.post('/auth/login', { email, password })),

  completeProfile: (name: string, email?: string) =>
    handleResponse<AuthResponse>(api.patch('/auth/complete-profile', { name, email })),

  setPassword: (password: string) =>
    handleResponse<{ message: string }>(api.patch('/auth/set-password', { password })),

  hasPassword: () => handleResponse<{ hasPassword: boolean }>(api.get('/auth/has-password')),

  getMe: () => handleResponse<User>(api.get('/auth/me')),
};

// ============== EVENTS API ==============
export const eventsApi = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Event[]>> => {
    const response = await handleResponse<PaginatedResponse<Event>>(
      api.get('/events', { params })
    );
    if (response.data) {
      return { data: response.data.data, status: response.status };
    }
    return { error: response.error, status: response.status };
  },

  getFeatured: () => handleResponse<Event[]>(api.get('/events/featured')),

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await handleResponse<{ category: string; count: number }[]>(
      api.get('/events/categories')
    );
    if (response.data) {
      return { data: response.data.map((c) => c.category), status: response.status };
    }
    return { error: response.error, status: response.status };
  },

  getById: (id: string) => handleResponse<Event>(api.get(`/events/${id}`)),

  create: (data: Partial<Event>) => handleResponse<Event>(api.post('/events', data)),

  update: (id: string, data: Partial<Event>) =>
    handleResponse<Event>(api.patch(`/events/${id}`, data)),

  getMyEvents: () => handleResponse<Event[]>(api.get('/events/organizer/my-events')),
};

// ============== TICKETS API ==============
export const ticketsApi = {
  purchase: (eventId: string, tickets: { ticketTypeId: string; quantity: number }[]) =>
    handleResponse<{ order: Order; tickets: Ticket[]; paymentRequired: number }>(
      api.post('/tickets/purchase', { eventId, tickets })
    ),

  getMyTickets: () => handleResponse<Ticket[]>(api.get('/tickets/my-tickets')),

  getTicket: (id: string) => handleResponse<Ticket>(api.get(`/tickets/${id}`)),

  validate: (qrCode: string) =>
    handleResponse<{ valid: boolean; message: string; ticket?: Ticket }>(
      api.post('/tickets/validate', { qrCode })
    ),
};

// ============== PAYMENTS API ==============
export const paymentsApi = {
  initiate: (orderId: string, method: PaymentMethod = 'CHAPA') =>
    handleResponse<PaymentInitiation>(api.post('/payments/initiate', { orderId, method })),

  getStatus: (orderId: string) =>
    handleResponse<{ status: string; paid: boolean }>(api.get(`/payments/status/${orderId}`)),

  verify: (orderId: string) =>
    handleResponse<{ verified: boolean; status: string; order: { id: string; status: string } }>(
      api.get(`/payments/verify/${orderId}`)
    ),
};

// ============== SHOP API ==============
export const shopApi = {
  getItems: (params?: { category?: string; eventId?: string }) =>
    handleResponse<ShopItem[]>(api.get('/shop/items', { params })),

  getItem: (id: string) => handleResponse<ShopItem>(api.get(`/shop/items/${id}`)),

  getCategories: () => handleResponse<string[]>(api.get('/shop/categories')),

  getPickupLocations: () => handleResponse<PickupLocation[]>(api.get('/shop/pickup-locations')),

  createOrder: (items: { shopItemId: string; quantity: number }[], pickupLocationId: string) =>
    handleResponse<{ order: ShopOrder; paymentRequired: number }>(
      api.post('/shop/orders', { items, pickupLocationId })
    ),

  getMyOrders: () => handleResponse<ShopOrder[]>(api.get('/shop/orders')),

  getOrder: (id: string) => handleResponse<ShopOrder>(api.get(`/shop/orders/${id}`)),

  validatePickup: (qrCode: string) =>
    handleResponse<{ valid: boolean; message: string; order?: ShopOrder }>(
      api.post('/shop/validate-pickup', { qrCode })
    ),
};

// ============== ADMIN API ==============
export const adminApi = {
  getDashboard: () => handleResponse<AdminDashboardStats>(api.get('/admin/dashboard')),

  // Users
  getUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    handleResponse<PaginatedResponse<User>>(api.get('/admin/users', { params })),

  getUser: (id: string) => handleResponse<User>(api.get(`/admin/users/${id}`)),

  updateUserRole: (id: string, role: string) =>
    handleResponse<User>(api.patch(`/admin/users/${id}/role`, { role })),

  // Events
  getAllEvents: (params?: { status?: string; search?: string; page?: number }) =>
    handleResponse<PaginatedResponse<Event>>(api.get('/admin/events', { params })),

  getPendingEvents: (params?: { page?: number }) =>
    handleResponse<PaginatedResponse<Event>>(api.get('/admin/events/pending', { params })),

  approveEvent: (id: string, featured?: boolean) =>
    handleResponse<Event>(api.post(`/admin/events/${id}/approve`, { featured })),

  rejectEvent: (id: string, reason: string) =>
    handleResponse<Event>(api.post(`/admin/events/${id}/reject`, { reason })),

  toggleEventFeatured: (id: string) =>
    handleResponse<Event>(api.patch(`/admin/events/${id}/featured`)),

  // Organizers
  getOrganizers: (params?: { status?: string; verified?: boolean; search?: string }) =>
    handleResponse<PaginatedResponse<MerchantProfile>>(api.get('/admin/organizers', { params })),

  verifyOrganizer: (id: string, commissionRate?: number) =>
    handleResponse<MerchantProfile>(api.post(`/admin/organizers/${id}/verify`, { commissionRate })),

  suspendOrganizer: (id: string, reason: string) =>
    handleResponse<MerchantProfile>(api.post(`/admin/organizers/${id}/suspend`, { reason })),

  // Shop Items
  getShopItems: () => handleResponse<ShopItem[]>(api.get('/admin/shop/items')),

  createShopItem: (data: Partial<ShopItem>) =>
    handleResponse<ShopItem>(api.post('/admin/shop/items', data)),

  updateShopItem: (id: string, data: Partial<ShopItem>) =>
    handleResponse<ShopItem>(api.patch(`/admin/shop/items/${id}`, data)),

  deleteShopItem: (id: string) =>
    handleResponse<void>(api.delete(`/admin/shop/items/${id}`)),

  // Pickup Locations
  getPickupLocations: () => handleResponse<PickupLocation[]>(api.get('/admin/pickup-locations')),

  createPickupLocation: (data: Partial<PickupLocation>) =>
    handleResponse<PickupLocation>(api.post('/admin/pickup-locations', data)),

  updatePickupLocation: (id: string, data: Partial<PickupLocation>) =>
    handleResponse<PickupLocation>(api.patch(`/admin/pickup-locations/${id}`, data)),

  deletePickupLocation: (id: string) =>
    handleResponse<void>(api.delete(`/admin/pickup-locations/${id}`)),
};

// ============== ORGANIZER API ==============
export const organizerApi = {
  getProfile: () => handleResponse<MerchantProfile>(api.get('/organizer/profile')),

  createProfile: (data: {
    businessName: string;
    tradeName?: string;
    description?: string;
    city?: string;
    bankName?: string;
    bankAccount?: string;
  }) => handleResponse<MerchantProfile>(api.post('/organizer/profile', data)),

  updateProfile: (data: Partial<MerchantProfile>) =>
    handleResponse<MerchantProfile>(api.patch('/organizer/profile', data)),

  getDashboard: () => handleResponse<OrganizerDashboardStats>(api.get('/organizer/dashboard')),

  // Events
  getMyEvents: () => handleResponse<Event[]>(api.get('/organizer/events')),

  getEvent: (id: string) => handleResponse<Event>(api.get(`/organizer/events/${id}`)),

  createEvent: (data: {
    title: string;
    description: string;
    venue: string;
    date: string;
    category: string;
    ticketTypes: Array<{
      name: string;
      price: number;
      quantity: number;
      description?: string;
    }>;
    imageUrl?: string;
    address?: string;
    city?: string;
    endDate?: string;
  }) => handleResponse<Event>(api.post('/organizer/events', data)),

  updateEvent: (id: string, data: Partial<Event>) =>
    handleResponse<Event>(api.patch(`/organizer/events/${id}`, data)),

  submitForApproval: (id: string) =>
    handleResponse<Event>(api.post(`/organizer/events/${id}/submit`)),

  publishEvent: (id: string) =>
    handleResponse<Event>(api.post(`/organizer/events/${id}/publish`)),

  cancelEvent: (id: string) =>
    handleResponse<Event>(api.post(`/organizer/events/${id}/cancel`)),

  // Attendees
  getEventAttendees: (eventId: string) =>
    handleResponse<{
      stats: { total: number; valid: number; used: number; cancelled: number };
      attendees: Ticket[];
    }>(api.get(`/organizer/events/${eventId}/attendees`)),

  // Wallet
  getWallet: () =>
    handleResponse<{
      available: number;
      pending: number;
      totalEarnings: number;
      totalWithdrawn: number;
    }>(api.get('/organizer/wallet')),

  getWalletTransactions: () =>
    handleResponse<Array<{
      id: string;
      type: string;
      amount: number;
      netAmount: number;
      commission: number;
      description: string;
      status: string;
      createdAt: string;
      eventName: string | null;
    }>>(api.get('/organizer/wallet/transactions')),

  getSettlements: () =>
    handleResponse<Array<{
      id: string;
      amount: number;
      status: string;
      bankName: string;
      accountNumber: string;
      requestedAt: string;
      completedAt: string | null;
    }>>(api.get('/organizer/wallet/settlements')),

  // Ticket Types
  addTicketType: (eventId: string, data: { name: string; price: number; quantity: number }) =>
    handleResponse<any>(api.post(`/organizer/events/${eventId}/ticket-types`, data)),

  updateTicketType: (eventId: string, ticketTypeId: string, data: Partial<any>) =>
    handleResponse<any>(api.patch(`/organizer/events/${eventId}/ticket-types/${ticketTypeId}`, data)),

  deleteTicketType: (eventId: string, ticketTypeId: string) =>
    handleResponse<void>(api.delete(`/organizer/events/${eventId}/ticket-types/${ticketTypeId}`)),
};

// ============== SHOP OWNER API ==============
export const shopOwnerApi = {
  getProfile: () => handleResponse<MerchantProfile>(api.get('/shop-owner/profile')),

  createProfile: (data: {
    businessName: string;
    tradeName?: string;
    description?: string;
    city?: string;
  }) => handleResponse<MerchantProfile>(api.post('/shop-owner/profile', data)),

  updateProfile: (data: Partial<MerchantProfile>) =>
    handleResponse<MerchantProfile>(api.patch('/shop-owner/profile', data)),

  getDashboard: () => handleResponse<any>(api.get('/shop-owner/dashboard')),

  // Orders
  getOrders: (status?: string) =>
    handleResponse<ShopOrder[]>(api.get('/shop-owner/orders', { params: { status } })),

  getOrder: (id: string) => handleResponse<ShopOrder>(api.get(`/shop-owner/orders/${id}`)),

  updateOrderStatus: (id: string, status: 'READY_FOR_PICKUP' | 'COMPLETED') =>
    handleResponse<ShopOrder>(api.patch(`/shop-owner/orders/${id}/status`, { status })),

  validatePickup: (qrCode: string) =>
    handleResponse<{ valid: boolean; message: string; order?: any }>(
      api.post('/shop-owner/validate-pickup', { qrCode })
    ),

  // Analytics
  getAnalytics: (period: 'week' | 'month' | 'year' = 'month') =>
    handleResponse<any>(api.get('/shop-owner/analytics', { params: { period } })),
};

export default api;
