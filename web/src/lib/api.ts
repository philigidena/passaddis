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
let refreshToken: string | null = localStorage.getItem('passaddis_refresh_token');
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

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

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
  if (token) {
    localStorage.setItem('passaddis_refresh_token', token);
  } else {
    localStorage.removeItem('passaddis_refresh_token');
  }
};

export const getAuthToken = () => authToken;
export const getRefreshToken = () => refreshToken;

export const clearAllTokens = () => {
  setAuthToken(null);
  setRefreshToken(null);
  localStorage.removeItem('passaddis_user');
};

// Initialize token from storage
if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Subscribe to token refresh
const subscribeToTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setAuthToken(accessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }
    return accessToken;
  } catch {
    clearAllTokens();
    return null;
  }
};

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and we have a refresh token and haven't retried
    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed, redirect to login
          window.location.href = '/signin';
          return Promise.reject(error);
        }
      }

      // Wait for token refresh
      return new Promise((resolve) => {
        subscribeToTokenRefresh((token: string) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    // No refresh token or other error
    if (error.response?.status === 401) {
      clearAllTokens();
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

  forgotPassword: (email: string) =>
    handleResponse<{ message: string }>(api.post('/auth/forgot-password', { email })),

  resetPassword: (token: string, newPassword: string) =>
    handleResponse<{ message: string }>(api.post('/auth/reset-password', { token, newPassword })),

  completeProfile: (name: string, email?: string) =>
    handleResponse<AuthResponse>(api.patch('/auth/complete-profile', { name, email })),

  setPassword: (password: string) =>
    handleResponse<{ message: string }>(api.patch('/auth/set-password', { password })),

  hasPassword: () => handleResponse<{ hasPassword: boolean }>(api.get('/auth/has-password')),

  getMe: () => handleResponse<User>(api.get('/auth/me')),

  // Session management
  refreshToken: (token: string) =>
    handleResponse<{ accessToken: string; refreshToken?: string }>(
      api.post('/auth/refresh', { refreshToken: token })
    ),

  logout: (refreshTokenValue?: string) =>
    handleResponse<{ message: string }>(
      api.post('/auth/logout', { refreshToken: refreshTokenValue })
    ),

  logoutAll: () => handleResponse<{ message: string }>(api.post('/auth/logout-all')),

  getSessions: () =>
    handleResponse<
      Array<{
        id: string;
        deviceInfo: string;
        ipAddress: string;
        createdAt: string;
        current: boolean;
      }>
    >(api.get('/auth/sessions')),

  revokeSession: (sessionId: string) =>
    handleResponse<{ message: string }>(api.delete(`/auth/sessions/${sessionId}`)),

  // Email verification
  verifyEmail: (token: string) =>
    handleResponse<{ message: string; success: boolean }>(
      api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    ),

  resendVerification: (email: string) =>
    handleResponse<{ message: string }>(api.post('/auth/resend-verification', { email })),
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

  // Ticket Transfer
  initiateTransfer: (ticketId: string, recipientPhone: string) =>
    handleResponse<{ transfer: any; message: string }>(
      api.post('/tickets/transfer/initiate', { ticketId, recipientPhone })
    ),

  claimTransfer: (transferCode: string) =>
    handleResponse<{ ticket: Ticket; message: string }>(
      api.post('/tickets/transfer/claim', { transferCode })
    ),

  cancelTransfer: (transferId: string) =>
    handleResponse<{ message: string }>(
      api.delete('/tickets/transfer/cancel', { data: { transferId } })
    ),

  getPendingTransfers: () =>
    handleResponse<{ outgoing: any[]; incoming: any[] }>(
      api.get('/tickets/transfer/pending')
    ),

  getTransferHistory: () =>
    handleResponse<any[]>(api.get('/tickets/transfer/history')),
};

// ============== PAYMENTS API ==============
export const paymentsApi = {
  initiate: (orderId: string, method: PaymentMethod = 'TELEBIRR') =>
    handleResponse<PaymentInitiation>(api.post('/payments/initiate', { orderId, method })),

  getStatus: (orderId: string) =>
    handleResponse<{ status: string; paid: boolean }>(api.get(`/payments/status/${orderId}`)),

  verify: (orderId: string) =>
    handleResponse<{ verified: boolean; status: string; order: { id: string; status: string } }>(
      api.get(`/payments/verify/${orderId}`)
    ),

  completeTestPayment: (paymentId: string) =>
    handleResponse<{ success: boolean; message: string; orderId: string }>(
      api.post(`/payments/test/complete/${paymentId}`)
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

// ============== WAITLIST API ==============
export const waitlistApi = {
  join: (eventId: string, ticketTypeId?: string) =>
    handleResponse<{ waitlist: any; position: number; message: string }>(
      api.post('/waitlist/join', { eventId, ticketTypeId })
    ),

  leave: (eventId: string) =>
    handleResponse<{ message: string }>(
      api.delete('/waitlist/leave', { data: { eventId } })
    ),

  getPosition: (eventId: string) =>
    handleResponse<{ position: number; totalWaiting: number } | null>(
      api.get(`/waitlist/position/${eventId}`)
    ),

  getMyWaitlists: () =>
    handleResponse<any[]>(api.get('/waitlist/my-waitlists')),
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
  getAllEvents: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
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

  rejectOrganizer: (id: string, reason: string) =>
    handleResponse<MerchantProfile>(api.post(`/admin/organizers/${id}/reject`, { reason })),

  reactivateOrganizer: (id: string) =>
    handleResponse<MerchantProfile>(api.post(`/admin/organizers/${id}/reactivate`)),

  // Shop Owners
  getShopOwners: (params?: { status?: string; verified?: boolean; search?: string; page?: number; limit?: number }) =>
    handleResponse<PaginatedResponse<MerchantProfile>>(api.get('/admin/shop-owners', { params })),

  getShopOwner: (id: string) =>
    handleResponse<MerchantProfile & { stats: { totalItems: number; totalOrders: number; totalRevenue: number } }>(
      api.get(`/admin/shop-owners/${id}`)
    ),

  approveShopOwner: (id: string, commissionRate?: number) =>
    handleResponse<MerchantProfile>(api.post(`/admin/shop-owners/${id}/approve`, { commissionRate })),

  rejectShopOwner: (id: string, reason: string) =>
    handleResponse<MerchantProfile>(api.post(`/admin/shop-owners/${id}/reject`, { reason })),

  suspendShopOwner: (id: string, reason: string) =>
    handleResponse<MerchantProfile>(api.post(`/admin/shop-owners/${id}/suspend`, { reason })),

  reactivateShopOwner: (id: string) =>
    handleResponse<MerchantProfile>(api.post(`/admin/shop-owners/${id}/reactivate`)),

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

  // Promo Codes
  getPromoCodes: () => handleResponse<any[]>(api.get('/promo')),

  createPromoCode: (data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    description?: string;
    maxUses?: number;
    minPurchase?: number;
    maxDiscount?: number;
    eventId?: string;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
  }) => handleResponse<any>(api.post('/promo', data)),

  updatePromoCode: (id: string, data: Partial<{
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    description: string;
    maxUses: number;
    minPurchase: number;
    maxDiscount: number;
    eventId: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
  }>) => handleResponse<any>(api.patch(`/promo/${id}`, data)),

  deletePromoCode: (id: string) => handleResponse<void>(api.delete(`/promo/${id}`)),

  getPromoCodeStats: (id: string) => handleResponse<any>(api.get(`/promo/${id}/stats`)),
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

  // Event Cloning
  cloneEvent: (eventId: string, data?: { title?: string; date?: string; endDate?: string }) =>
    handleResponse<Event>(api.post(`/organizer/events/${eventId}/clone`, data || {})),

  // CSV Exports
  exportAttendees: (eventId: string) =>
    api.get(`/organizer/events/${eventId}/attendees/export`, { responseType: 'blob' }),

  exportSalesReport: (params?: { eventId?: string; startDate?: string; endDate?: string }) =>
    api.get('/organizer/reports/sales/export', { params, responseType: 'blob' }),

  exportWalletTransactions: () =>
    api.get('/organizer/wallet/transactions/export', { responseType: 'blob' }),
};

// ============== WHATSAPP API ==============
export const whatsappApi = {
  getEventShareLink: (eventId: string) =>
    handleResponse<{ eventId: string; eventTitle: string; whatsappUrl: string; shareMessage: string }>(
      api.get(`/events/${eventId}/share/whatsapp`)
    ),

  getSupportLink: (subject?: string, orderId?: string) =>
    handleResponse<{ url: string; message: string }>(
      api.get('/events/support/whatsapp', { params: { subject, orderId } })
    ),

  getTicketShareLink: (ticketId: string) =>
    handleResponse<{ ticketId: string; eventTitle: string; whatsappUrl: string; shareMessage: string }>(
      api.get(`/tickets/${ticketId}/share/whatsapp`)
    ),
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

  cancelOrder: (id: string, reason: string) =>
    handleResponse<ShopOrder>(api.post(`/shop-owner/orders/${id}/cancel`, { reason })),

  // Analytics
  getAnalytics: (period: 'week' | 'month' | 'year' = 'month') =>
    handleResponse<any>(api.get('/shop-owner/analytics', { params: { period } })),

  // Shop Items Management
  getItems: (params?: {
    category?: string;
    search?: string;
    curatedOnly?: boolean;
    inStockOnly?: boolean;
    eventId?: string;
  }) => handleResponse<ShopItem[]>(api.get('/shop-owner/items', { params })),

  getItem: (id: string) => handleResponse<ShopItem>(api.get(`/shop-owner/items/${id}`)),

  createItem: (data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category: string;
    stockQuantity?: number;
    lowStockThreshold?: number;
    sku?: string;
    isCurated?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
    badge?: string;
    eventId?: string;
  }) => handleResponse<ShopItem>(api.post('/shop-owner/items', data)),

  updateItem: (id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    inStock: boolean;
    stockQuantity: number;
    lowStockThreshold: number;
    sku: string;
    isCurated: boolean;
    isFeatured: boolean;
    displayOrder: number;
    badge: string;
    eventId: string;
  }>) => handleResponse<ShopItem>(api.patch(`/shop-owner/items/${id}`, data)),

  deleteItem: (id: string) => handleResponse<ShopItem>(api.delete(`/shop-owner/items/${id}`)),

  // Curated Items
  getCuratedItems: () => handleResponse<ShopItem[]>(api.get('/shop-owner/items/curated')),

  updateCuratedStatus: (itemIds: string[], isCurated: boolean) =>
    handleResponse<{ updated: number }>(
      api.post('/shop-owner/items/curated', { itemIds, isCurated })
    ),

  reorderCuratedItems: (items: Array<{ id: string; displayOrder: number }>) =>
    handleResponse<{ reordered: number }>(
      api.post('/shop-owner/items/curated/reorder', { items })
    ),

  // Stock Management
  updateStock: (itemId: string, stockQuantity: number, reason?: string) =>
    handleResponse<ShopItem>(
      api.patch(`/shop-owner/items/${itemId}/stock`, { stockQuantity, reason })
    ),

  getLowStockItems: () => handleResponse<ShopItem[]>(api.get('/shop-owner/items/low-stock')),
};

export default api;
