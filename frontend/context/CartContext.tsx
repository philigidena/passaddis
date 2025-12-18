/**
 * PassAddis Cart Context
 * Manages shopping cart state across the app
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage helpers
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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  maxQuantity?: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@passaddis_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({
    items: [],
    isLoading: true,
  });

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveCart(state.items);
    }
  }, [state.items, state.isLoading]);

  const loadCart = async () => {
    try {
      const cartJson = await storage.getItem(CART_STORAGE_KEY);
      if (cartJson) {
        const items = JSON.parse(cartJson) as CartItem[];
        setState({ items, isLoading: false });
      } else {
        setState({ items: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setState({ items: [], isLoading: false });
    }
  };

  const saveCart = async (items: CartItem[]) => {
    try {
      await storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setState(prev => {
      const existingIndex = prev.items.findIndex(i => i.id === item.id);

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...prev.items];
        const maxQty = item.maxQuantity || 99;
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: Math.min(newItems[existingIndex].quantity + quantity, maxQty),
        };
        return { ...prev, items: newItems };
      } else {
        // Add new item
        return {
          ...prev,
          items: [...prev.items, { ...item, quantity }],
        };
      }
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) {
        return {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId),
        };
      }

      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          const maxQty = item.maxQuantity || 99;
          return { ...item, quantity: Math.min(quantity, maxQty) };
        }
        return item;
      });

      return { ...prev, items: newItems };
    });
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, items: [] }));
  }, []);

  const getItemQuantity = useCallback((itemId: string): number => {
    const item = state.items.find(i => i.id === itemId);
    return item?.quantity || 0;
  }, [state.items]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
