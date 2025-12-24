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

export default api;
