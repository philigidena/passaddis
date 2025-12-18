/**
 * PassAddis Authentication Context
 * Manages user authentication state across the app
 * Supports both OTP and Email/Password authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { authApi, setAuthToken, User } from '../services/api';

// Storage helpers - use SecureStore on native, localStorage on web
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthResult = { success: boolean; error?: string };

interface AuthContextType extends AuthState {
  // OTP Authentication
  sendOtp: (phone: string) => Promise<AuthResult>;
  verifyOtp: (phone: string, code: string) => Promise<AuthResult>;

  // Email/Password Authentication
  register: (email: string, password: string, name: string, phone?: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;

  // Profile Management
  completeProfile: (name: string, email?: string) => Promise<AuthResult>;
  setPassword: (password: string) => Promise<AuthResult>;

  // Session Management
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = '@passaddis_auth_token';
const USER_KEY = '@passaddis_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userJson] = await Promise.all([
        storage.getItem(AUTH_TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);

      if (token && userJson) {
        setAuthToken(token);
        const user = JSON.parse(userJson) as User;
        setState({ user, isLoading: false, isAuthenticated: true });

        // Verify token is still valid
        const response = await authApi.getMe();
        if (response.data) {
          setState({ user: response.data, isLoading: false, isAuthenticated: true });
          await storage.setItem(USER_KEY, JSON.stringify(response.data));
        } else if (response.status === 401) {
          // Token expired, clear auth
          await clearAuth();
        }
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const clearAuth = async () => {
    setAuthToken(null);
    await Promise.all([
      storage.removeItem(AUTH_TOKEN_KEY),
      storage.removeItem(USER_KEY),
    ]);
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  const sendOtp = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    const response = await authApi.sendOtp(phone);
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  };

  const verifyOtp = async (phone: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const response = await authApi.verifyOtp(phone, code);
    if (response.error || !response.data) {
      return { success: false, error: response.error || 'Verification failed' };
    }

    const { accessToken, user } = response.data;

    // Store auth data
    setAuthToken(accessToken);
    await storage.setItem(AUTH_TOKEN_KEY, accessToken);
    await storage.setItem(USER_KEY, JSON.stringify(user));

    setState({ user, isLoading: false, isAuthenticated: true });
    return { success: true };
  };

  const completeProfile = async (name: string, email?: string): Promise<AuthResult> => {
    const response = await authApi.completeProfile(name, email);
    if (response.error || !response.data) {
      return { success: false, error: response.error || 'Profile update failed' };
    }

    await storage.setItem(USER_KEY, JSON.stringify(response.data));
    setState(prev => ({ ...prev, user: response.data! }));
    return { success: true };
  };

  // ============== EMAIL/PASSWORD AUTHENTICATION ==============

  const register = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<AuthResult> => {
    const response = await authApi.register(email, password, name, phone);
    if (response.error || !response.data) {
      return { success: false, error: response.error || 'Registration failed' };
    }

    const { accessToken, user } = response.data;

    // Store auth data
    setAuthToken(accessToken);
    await storage.setItem(AUTH_TOKEN_KEY, accessToken);
    await storage.setItem(USER_KEY, JSON.stringify(user));

    setState({ user, isLoading: false, isAuthenticated: true });
    return { success: true };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const response = await authApi.login(email, password);
    if (response.error || !response.data) {
      return { success: false, error: response.error || 'Login failed' };
    }

    const { accessToken, user } = response.data;

    // Store auth data
    setAuthToken(accessToken);
    await storage.setItem(AUTH_TOKEN_KEY, accessToken);
    await storage.setItem(USER_KEY, JSON.stringify(user));

    setState({ user, isLoading: false, isAuthenticated: true });
    return { success: true };
  };

  const setPassword = async (password: string): Promise<AuthResult> => {
    const response = await authApi.setPassword(password);
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  };

  // ============== SESSION MANAGEMENT ==============

  const logout = async () => {
    await clearAuth();
  };

  const refreshUser = async () => {
    const response = await authApi.getMe();
    if (response.data) {
      await storage.setItem(USER_KEY, JSON.stringify(response.data));
      setState(prev => ({ ...prev, user: response.data! }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        // OTP
        sendOtp,
        verifyOtp,
        // Email/Password
        register,
        login,
        // Profile
        completeProfile,
        setPassword,
        // Session
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
