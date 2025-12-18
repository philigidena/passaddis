/**
 * useShop Hook
 * Fetches and manages shop data from the API
 */

import { useState, useEffect, useCallback } from 'react';
import { shopApi, ShopItem as ApiShopItem } from '@/services/api';
import { SHOP_ITEMS, SHOP_CATEGORIES, PICKUP_LOCATIONS, ShopItem as LocalShopItem } from '@/data/shop';

// Unified ShopItem type that works with both API and mock data
export interface ShopItemDisplay {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  image: string;
  imageUrl?: string;
  category: string;
  inStock: boolean;
  badge?: string;
  eventId?: string;
}

interface UseShopOptions {
  category?: string;
  eventId?: string;
  autoFetch?: boolean;
}

interface UseShopReturn {
  items: ShopItemDisplay[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchByCategory: (category: string) => Promise<void>;
}

// Transform API response to unified format
function transformApiItem(item: ApiShopItem): ShopItemDisplay {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    priceDisplay: `${item.price} ETB`,
    image: item.imageUrl,
    imageUrl: item.imageUrl,
    category: item.category,
    inStock: item.inStock,
    eventId: item.eventId,
  };
}

// Transform mock data to unified format
function transformMockItem(item: LocalShopItem): ShopItemDisplay {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    priceDisplay: item.priceDisplay,
    image: item.image,
    category: item.category,
    inStock: item.inStock,
    badge: item.badge,
  };
}

export function useShop(options: UseShopOptions = {}): UseShopReturn {
  const { autoFetch = true } = options;

  const [items, setItems] = useState<ShopItemDisplay[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (params?: { category?: string; eventId?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        shopApi.getItems(params),
        shopApi.getCategories(),
      ]);

      if (itemsResponse.data) {
        setItems(itemsResponse.data.map(transformApiItem));
      } else if (itemsResponse.error) {
        // Fallback to mock data if API fails
        console.log('Using mock shop data:', itemsResponse.error);
        const mockItems = params?.category && params.category !== 'All'
          ? SHOP_ITEMS.filter(item => item.category === params.category)
          : SHOP_ITEMS;
        setItems(mockItems.map(transformMockItem));
      }

      if (categoriesResponse.data) {
        setCategories(['All', ...categoriesResponse.data]);
      } else {
        // Fallback to mock categories
        setCategories(SHOP_CATEGORIES.map(c => c.id));
      }
    } catch (err) {
      // Fallback to mock data on network error
      console.log('Network error, using mock shop data');
      setItems(SHOP_ITEMS.map(transformMockItem));
      setCategories(SHOP_CATEGORIES.map(c => c.id));
      setError(err instanceof Error ? err.message : 'Failed to fetch shop items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchByCategory = useCallback(async (category: string) => {
    await fetchItems({ category: category === 'All' ? undefined : category });
  }, [fetchItems]);

  const refetch = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
  }, [autoFetch, fetchItems]);

  return {
    items,
    categories,
    isLoading,
    error,
    refetch,
    fetchByCategory,
  };
}

// Hook for fetching a single shop item
export function useShopItem(itemId: string) {
  const [item, setItem] = useState<ShopItemDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!itemId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await shopApi.getItem(itemId);
      if (response.data) {
        setItem(transformApiItem(response.data));
      } else if (response.error) {
        // Fallback to mock data
        const mockItem = SHOP_ITEMS.find(i => i.id === itemId);
        if (mockItem) {
          setItem(transformMockItem(mockItem));
        } else {
          setError(response.error);
        }
      }
    } catch (err) {
      // Fallback to mock data
      const mockItem = SHOP_ITEMS.find(i => i.id === itemId);
      if (mockItem) {
        setItem(transformMockItem(mockItem));
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch shop item');
      }
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    isLoading,
    error,
    refetch: fetchItem,
  };
}

// Export pickup locations (these are static for now)
export { PICKUP_LOCATIONS };
