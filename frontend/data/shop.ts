export interface ShopItem {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  badge?: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  area: string;
  address: string;
  hours: string;
}

export interface ShopCategory {
  id: string;
  label: string;
  icon: string;
}

// Partner supermarkets where users can pick up their orders
export const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: '1',
    name: 'Shoa Supermarket',
    area: 'Bole',
    address: 'Bole Road, near Edna Mall',
    hours: '8 AM - 10 PM',
  },
  {
    id: '2',
    name: 'Safeway Supermarket',
    area: 'Sarbet',
    address: 'Sarbet, Lideta',
    hours: '7 AM - 9 PM',
  },
  {
    id: '3',
    name: 'Fantu Supermarket',
    area: 'Kazanchis',
    address: 'Kazanchis, near Intercontinental',
    hours: '8 AM - 9 PM',
  },
  {
    id: '4',
    name: 'Queens Supermarket',
    area: 'CMC',
    address: 'CMC Road, Michael',
    hours: '8 AM - 10 PM',
  },
];

// Shop categories for filtering
export const SHOP_CATEGORIES: ShopCategory[] = [
  { id: 'All', label: 'All', icon: 'grid-outline' },
  { id: 'Water', label: 'Water', icon: 'water-outline' },
  { id: 'Drinks', label: 'Soft Drinks', icon: 'cafe-outline' },
  { id: 'Snacks', label: 'Snacks', icon: 'fast-food-outline' },
  { id: 'Merch', label: 'Merch', icon: 'shirt-outline' },
];

// Curated items available for pickup at partner supermarkets
export const SHOP_ITEMS: ShopItem[] = [
  // Water
  {
    id: '1',
    name: 'Ambo Water Pack (6)',
    price: 180,
    priceDisplay: '180 ETB',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop&q=80',
    category: 'Water',
    description: 'Pack of 6 Ambo mineral water bottles',
    inStock: true,
    badge: 'Popular',
  },
  {
    id: '2',
    name: 'Highland Water Pack (12)',
    price: 150,
    priceDisplay: '150 ETB',
    image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop&q=80',
    category: 'Water',
    description: 'Pack of 12 Highland purified water',
    inStock: true,
  },
  // Soft Drinks
  {
    id: '3',
    name: 'Coca-Cola Pack (6)',
    price: 210,
    priceDisplay: '210 ETB',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop&q=80',
    category: 'Drinks',
    description: '6 cans of ice-cold Coca-Cola',
    inStock: true,
  },
  {
    id: '4',
    name: 'Mirinda & Sprite Mix',
    price: 200,
    priceDisplay: '200 ETB',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop&q=80',
    category: 'Drinks',
    description: '3 Mirinda + 3 Sprite cans',
    inStock: true,
  },
  {
    id: '5',
    name: 'Red Bull (4 Pack)',
    price: 400,
    priceDisplay: '400 ETB',
    image: 'https://images.unsplash.com/photo-1613217786163-5896419a2574?w=400&h=400&fit=crop&q=80',
    category: 'Drinks',
    description: 'Energy boost for all-night events',
    inStock: true,
    badge: 'Event Pick',
  },
  // Snacks
  {
    id: '6',
    name: 'Chips Party Pack',
    price: 280,
    priceDisplay: '280 ETB',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&q=80',
    category: 'Snacks',
    description: 'Assorted chips - Lays, Pringles mix',
    inStock: true,
    badge: 'Best Seller',
  },
  {
    id: '7',
    name: 'Mixed Nuts & Dried Fruits',
    price: 250,
    priceDisplay: '250 ETB',
    image: 'https://images.unsplash.com/photo-1536591375657-fc29be29f3be?w=400&h=400&fit=crop&q=80',
    category: 'Snacks',
    description: 'Premium healthy snack mix',
    inStock: true,
  },
  {
    id: '8',
    name: 'Chocolate Assortment',
    price: 350,
    priceDisplay: '350 ETB',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop&q=80',
    category: 'Snacks',
    description: 'Snickers, Twix, KitKat mix',
    inStock: true,
  },
  {
    id: '9',
    name: 'Biscuit Variety Box',
    price: 180,
    priceDisplay: '180 ETB',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop&q=80',
    category: 'Snacks',
    description: 'Assorted biscuits and cookies',
    inStock: true,
  },
  {
    id: '10',
    name: 'Popcorn Mega Pack',
    price: 150,
    priceDisplay: '150 ETB',
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=400&fit=crop&q=80',
    category: 'Snacks',
    description: 'Ready-to-eat popcorn for movies & events',
    inStock: true,
  },
  // Merch
  {
    id: '11',
    name: 'PassAddis Event T-Shirt',
    price: 500,
    priceDisplay: '500 ETB',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80',
    category: 'Merch',
    description: 'Official PassAddis branded tee',
    inStock: true,
    badge: 'New',
  },
  {
    id: '12',
    name: 'Glow Sticks Pack (10)',
    price: 120,
    priceDisplay: '120 ETB',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&q=80',
    category: 'Merch',
    description: 'Light up your concert experience',
    inStock: false,
  },
];
