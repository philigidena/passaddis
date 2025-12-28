import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { shopOwnerApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { ShopOrder } from '@/types';

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ScanIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2M6 4h2m8 0h2" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', path: '/shop-owner', icon: <DashboardIcon /> },
  { label: 'Orders', path: '/shop-owner/orders', icon: <OrdersIcon /> },
  { label: 'Scan Pickup', path: '/shop-owner/scan', icon: <ScanIcon /> },
  { label: 'Settings', path: '/shop-owner/settings', icon: <SettingsIcon /> },
];

interface ValidationResult {
  valid: boolean;
  message: string;
  order?: ShopOrder;
}

export function ShopOwnerScan() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    setValidating(true);
    setResult(null);

    try {
      const response = await shopOwnerApi.validatePickup(qrCode.trim());
      if (response.data) {
        setResult(response.data as ValidationResult);
      } else {
        setResult({
          valid: false,
          message: response.error || 'Failed to validate pickup code',
        });
      }
    } catch (error) {
      setResult({
        valid: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleReset = () => {
    setQrCode('');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Shop Owner Portal" navItems={navItems} accentColor="orange">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Shop Owner Portal" navItems={navItems} accentColor="orange">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Scan Pickup</h1>
        <p className="text-gray-400 mt-1">Validate customer pickup codes</p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Scan Input */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <ScanIcon />
          </div>

          <form onSubmit={handleValidate}>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Enter Pickup Code
            </label>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value.toUpperCase())}
              placeholder="e.g., PA-ABC123DEF456"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 text-center font-mono text-lg"
              disabled={validating}
            />
            <DashboardButton
              type="submit"
              variant="primary"
              className="w-full mt-4"
              disabled={!qrCode.trim() || validating}
            >
              {validating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Validating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validate Pickup
                </>
              )}
            </DashboardButton>
          </form>

          <p className="text-sm text-gray-400 text-center mt-4">
            Enter the code shown on the customer's order confirmation
          </p>
        </div>

        {/* Result */}
        {result && (
          <div className={`bg-gray-800 rounded-xl border ${
            result.valid ? 'border-green-500/50' : 'border-red-500/50'
          } overflow-hidden`}>
            {/* Result Header */}
            <div className={`p-6 ${result.valid ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center justify-center gap-3">
                {result.valid ? (
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div>
                  <h3 className={`text-xl font-bold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {result.valid ? 'Pickup Validated!' : 'Invalid Code'}
                  </h3>
                  <p className="text-gray-400">{result.message}</p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            {result.valid && result.order && (
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">ORDER DETAILS</h4>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order #</span>
                    <span className="text-white font-medium">{result.order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Items</span>
                    <span className="text-white">{result.order.items.length} item(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="text-orange-400 font-bold">{formatCurrency(result.order.total)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">ITEMS</h4>
                  <div className="space-y-2">
                    {result.order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-white">{item.quantity}x {item.shopItem.name}</span>
                        <span className="text-gray-400">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 pt-0">
              <DashboardButton
                onClick={handleReset}
                variant="secondary"
                className="w-full"
              >
                <ScanIcon />
                Scan Another
              </DashboardButton>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Tips</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ask customer to show their order confirmation with QR code
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Codes start with "PA-" followed by alphanumeric characters
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify items before handing over the order
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
