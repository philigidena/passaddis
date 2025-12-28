import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi, setAuthToken, setRefreshToken, clearAllTokens, getRefreshToken } from '@/lib/api';
import type { User } from '@/types';

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
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'passaddis_user';

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
      const token = localStorage.getItem('passaddis_token');
      const userJson = localStorage.getItem(USER_STORAGE_KEY);

      if (token && userJson) {
        setAuthToken(token);
        const user = JSON.parse(userJson) as User;
        setState({ user, isLoading: false, isAuthenticated: true });

        // Verify token is still valid
        const response = await authApi.getMe();
        if (response.data) {
          setState({ user: response.data, isLoading: false, isAuthenticated: true });
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
        } else if (response.status === 401) {
          // Token expired
          clearAuth();
        }
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const clearAuth = useCallback(() => {
    clearAllTokens();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const sendOtp = async (phone: string): Promise<AuthResult> => {
    const response = await authApi.sendOtp(phone);
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  };

  const verifyOtp = async (phone: string, code: string): Promise<AuthResult> => {
    const response = await authApi.verifyOtp(phone, code);
    if (response.error || !response.data) {
      return { success: false, error: response.error || 'Verification failed' };
    }

    const { accessToken, refreshToken, user } = response.data;
    setAuthToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setState({ user, isLoading: false, isAuthenticated: true });
    return { success: true };
  };

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

    const { accessToken, refreshToken, user } = response.data;
    setAuthToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setState({ user, isLoading: false, isAuthenticated: true });
    return { success: true };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const response = await authApi.login(email, password);
    if (response.error || !response.data) {
      return { success: false, error: response.error || 'Login failed' };
    }

    const { accessToken, refreshToken, user } = response.data;
    setAuthToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setState({ user, isLoading: false, isAuthenticated: true });
    return { success: true };
  };

  const completeProfile = async (name: string, email?: string): Promise<AuthResult> => {
    const response = await authApi.completeProfile(name, email);
    if (response.error || !response.data) {
      return { success: false, error: response.error || 'Profile update failed' };
    }

    // The backend returns AuthResponseDto with { accessToken, user }
    const { user } = response.data;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
    return { success: true };
  };

  const setPassword = async (password: string): Promise<AuthResult> => {
    const response = await authApi.setPassword(password);
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  };

  const logout = useCallback(async () => {
    // Try to revoke the refresh token on the backend
    const refreshTokenValue = getRefreshToken();
    if (refreshTokenValue) {
      try {
        await authApi.logout(refreshTokenValue);
      } catch {
        // Ignore errors during logout
      }
    }
    clearAuth();
  }, [clearAuth]);

  const refreshUser = async () => {
    const response = await authApi.getMe();
    if (response.data) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      setState((prev) => ({ ...prev, user: response.data! }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        sendOtp,
        verifyOtp,
        register,
        login,
        completeProfile,
        setPassword,
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
