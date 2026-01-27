import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
  MapPin,
  X,
  ChevronRight,
  Package,
  Search,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { shopApi, paymentsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { ShopItem, PickupLocation, CartItem } from '@/types';
import clsx from 'clsx';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'WATER', label: 'Water' },
  { id: 'DRINKS', label: 'Drinks' },
  { id: 'SNACKS', label: 'Snacks' },
  { id: 'MERCH', label: 'Merch' },
];

const CART_STORAGE_KEY = 'passaddis_cart';

export function ShopPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PickupLocation | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'location' | 'confirm'>('cart');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate cart structure
        if (Array.isArray(parsedCart) && parsedCart.every(item => item.shopItemId && item.quantity)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [itemsRes, locationsRes] = await Promise.all([
      shopApi.getItems(),
      shopApi.getPickupLocations(),
    ]);

    if (itemsRes.data) {
      setItems(itemsRes.data);

      // Update cart items with fresh data from API
      setCart(prevCart => {
        const itemsMap = new Map(itemsRes.data!.map((item: ShopItem) => [item.id, item]));
        return prevCart
          .filter(cartItem => {
            const item = itemsMap.get(cartItem.shopItemId);
            // Remove items that no longer exist or are out of stock
            return item && item.inStock;
          })
          .map(cartItem => {
            const item = itemsMap.get(cartItem.shopItemId);
            if (item) {
              return { ...cartItem, shopItem: item };
            }
            return cartItem;
          });
      });
    }
    if (locationsRes.data) {
      setPickupLocations(locationsRes.data);
    }
    setLoading(false);
  };

  const filteredItems = items
    .filter(item => {
      // Filter by category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }

      return true;
    });

  const addToCart = (item: ShopItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.shopItemId === item.id);
      if (existing) {
        return prev.map(c =>
          c.shopItemId === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { shopItemId: item.id, shopItem: item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (shopItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(c => {
          if (c.shopItemId === shopItemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter((c): c is CartItem => c !== null);
    });
  };

  const removeFromCart = (shopItemId: string) => {
    setCart(prev => prev.filter(c => c.shopItemId !== shopItemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.shopItem.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!selectedLocation) {
      setCheckoutStep('location');
      setShowCart(true);
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    const orderItems = cart.map(c => ({
      shopItemId: c.shopItemId,
      quantity: c.quantity,
    }));

    const result = await shopApi.createOrder(orderItems, selectedLocation.id);

    if (result.error) {
      setCheckoutError(result.error);
      setIsCheckingOut(false);
      return;
    }

    if (result.data) {
      // Clear cart after successful order creation
      setCart([]);

      // If payment required, initiate payment
      if (result.data.paymentRequired > 0) {
        const paymentResult = await paymentsApi.initiate(result.data.order.id, 'TELEBIRR');
        if (paymentResult.error) {
          setCheckoutError(paymentResult.error);
          setIsCheckingOut(false);
          return;
        }
        if (paymentResult.data?.checkout_url) {
          window.location.href = paymentResult.data.checkout_url;
          return;
        } else {
          setCheckoutError('Payment service temporarily unavailable. Please try again later.');
          setIsCheckingOut(false);
          return;
        }
      }
      // If free, go to order detail
      navigate(`/shop/orders/${result.data.order.id}`);
    }

    setIsCheckingOut(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg">
        {/* Header */}
        <div className="bg-dark-card border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Event Shop</h1>
                <p className="text-white/60 mt-1">
                  Pre-order snacks and drinks for pickup at your event
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCart(true);
                  setCheckoutStep('cart');
                }}
                className="relative p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-dark-card/30 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-dark-card/50 border-b border-white/5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={clsx(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
              <p className="text-white/60">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : selectedCategory !== 'all'
                    ? 'Try selecting a different category'
                    : 'Shop items will appear here soon'}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  cartQuantity={cart.find(c => c.shopItemId === item.id)?.quantity || 0}
                  onAdd={() => addToCart(item)}
                  onUpdateQuantity={(delta) => updateCartQuantity(item.id, delta)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart Button (Mobile) */}
        {cartCount > 0 && !showCart && (
          <div className="fixed bottom-6 left-4 right-4 md:hidden">
            <Button
              className="w-full shadow-lg"
              onClick={() => {
                setShowCart(true);
                setCheckoutStep('cart');
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  View Cart ({cartCount})
                </span>
                <span>{cartTotal.toLocaleString()} ETB</span>
              </div>
            </Button>
          </div>
        )}

        {/* Cart Slide-over */}
        {showCart && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-dark-card border-l border-white/10 flex flex-col">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">
                  {checkoutStep === 'cart' && 'Your Cart'}
                  {checkoutStep === 'location' && 'Select Pickup Location'}
                  {checkoutStep === 'confirm' && 'Confirm Order'}
                </h2>
                <button onClick={() => setShowCart(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {checkoutStep === 'cart' && (
                  <>
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.shopItemId} className="flex gap-4 bg-white/5 rounded-xl p-4">
                            <img
                              src={item.shopItem.imageUrl || 'https://via.placeholder.com/80'}
                              alt={item.shopItem.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{item.shopItem.name}</h3>
                              <p className="text-primary text-sm">{item.shopItem.price.toLocaleString()} ETB</p>
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() => updateCartQuantity(item.shopItemId, -1)}
                                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.shopItemId, 1)}
                                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.shopItemId)}
                                  className="ml-auto text-white/40 hover:text-danger text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {checkoutStep === 'location' && (
                  <div className="space-y-3">
                    {pickupLocations.map(location => (
                      <button
                        key={location.id}
                        onClick={() => {
                          setSelectedLocation(location);
                          setCheckoutStep('confirm');
                        }}
                        className={clsx(
                          'w-full text-left p-4 rounded-xl border transition-colors',
                          selectedLocation?.id === location.id
                            ? 'bg-primary/10 border-primary/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{location.name}</h3>
                            <p className="text-white/60 text-sm">{location.area}</p>
                            <p className="text-white/40 text-sm">{location.address}</p>
                            <p className="text-primary/80 text-sm mt-1">{location.hours}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/40" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {checkoutStep === 'confirm' && (
                  <div className="space-y-6">
                    {/* Order Items Summary */}
                    <div>
                      <h3 className="text-white/60 text-sm font-medium mb-3">ORDER ITEMS</h3>
                      <div className="space-y-2">
                        {cart.map(item => (
                          <div key={item.shopItemId} className="flex justify-between text-white">
                            <span>{item.quantity}x {item.shopItem.name}</span>
                            <span>{(item.shopItem.price * item.quantity).toLocaleString()} ETB</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pickup Location */}
                    <div>
                      <h3 className="text-white/60 text-sm font-medium mb-3">PICKUP LOCATION</h3>
                      {selectedLocation && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <h4 className="text-white font-medium">{selectedLocation.name}</h4>
                              <p className="text-white/60 text-sm">{selectedLocation.address}</p>
                              <p className="text-primary/80 text-sm mt-1">{selectedLocation.hours}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setCheckoutStep('location')}
                            className="mt-3 text-primary text-sm hover:underline"
                          >
                            Change location
                          </button>
                        </div>
                      )}
                    </div>

                    {checkoutError && (
                      <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
                        <p className="text-danger text-sm">{checkoutError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-dark-card">
                  <div className="flex justify-between text-white mb-4">
                    <span className="text-white/60">Subtotal</span>
                    <span className="font-semibold">{cartTotal.toLocaleString()} ETB</span>
                  </div>

                  {checkoutStep === 'cart' && (
                    <Button className="w-full" onClick={() => setCheckoutStep('location')}>
                      Continue to Pickup Location
                    </Button>
                  )}

                  {checkoutStep === 'location' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCheckoutStep('cart')}
                    >
                      Back to Cart
                    </Button>
                  )}

                  {checkoutStep === 'confirm' && (
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          `Pay ${cartTotal.toLocaleString()} ETB`
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCheckoutStep('location')}
                      >
                        Back
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ShopItemCard({
  item,
  cartQuantity,
  onAdd,
  onUpdateQuantity,
}: {
  item: ShopItem;
  cartQuantity: number;
  onAdd: () => void;
  onUpdateQuantity: (delta: number) => void;
}) {
  return (
    <div className="bg-dark-card rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
      <div className="aspect-square relative">
        <img
          src={item.imageUrl || 'https://via.placeholder.com/300'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-medium line-clamp-2 min-h-[2.5rem]">{item.name}</h3>
        {item.description && (
          <p className="text-white/40 text-sm line-clamp-1 mt-1">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <p className="text-primary font-bold">{item.price.toLocaleString()} ETB</p>
          {item.inStock && (
            <>
              {cartQuantity === 0 ? (
                <button
                  onClick={onAdd}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(-1)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-medium w-6 text-center">{cartQuantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(1)}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
