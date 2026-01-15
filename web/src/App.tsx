import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { HomePage } from '@/pages/Home';
import { EventsPage } from '@/pages/Events';
import { EventDetailPage } from '@/pages/EventDetail';
import { SignInPage } from '@/pages/SignIn';
import { TicketsPage } from '@/pages/Tickets';
import { TicketDetailPage } from '@/pages/TicketDetail';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminEvents } from '@/pages/admin/AdminEvents';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminOrganizers } from '@/pages/admin/AdminOrganizers';
import { AdminShop } from '@/pages/admin/AdminShop';
import { AdminPromos } from '@/pages/admin/AdminPromos';
import { AdminShopOwners } from '@/pages/admin/AdminShopOwners';
import { ShopPage } from '@/pages/Shop';
import { ShopOrdersPage } from '@/pages/ShopOrders';
import { ShopOrderDetailPage } from '@/pages/ShopOrderDetail';
import { OrganizerDashboard } from '@/pages/organizer/OrganizerDashboard';
import { OrganizerEvents } from '@/pages/organizer/OrganizerEvents';
import { OrganizerWallet } from '@/pages/organizer/OrganizerWallet';
import { OrganizerSettings } from '@/pages/organizer/OrganizerSettings';
import { ShopOwnerDashboard } from '@/pages/shop-owner/ShopOwnerDashboard';
import { ShopOwnerOrders } from '@/pages/shop-owner/ShopOwnerOrders';
import { ShopOwnerScan } from '@/pages/shop-owner/ShopOwnerScan';
import { ShopOwnerItems } from '@/pages/shop-owner/ShopOwnerItems';
import { ShopOwnerSettings } from '@/pages/shop-owner/ShopOwnerSettings';
import { ProfilePage } from '@/pages/Profile';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/login" element={<Navigate to="/signin" replace />} />

      {/* Protected User Routes */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organizers"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminOrganizers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/shop"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminShop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/promos"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPromos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/shop-owners"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminShopOwners />
          </ProtectedRoute>
        }
      />

      {/* Organizer Routes */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN', 'USER']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events"
        element={
          <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
            <OrganizerEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events/new"
        element={
          <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
            <OrganizerEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/wallet"
        element={
          <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
            <OrganizerWallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/settings"
        element={
          <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN', 'USER']}>
            <OrganizerSettings />
          </ProtectedRoute>
        }
      />

      {/* Shop Owner Routes */}
      <Route
        path="/shop-owner"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN', 'USER']}>
            <ShopOwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/items"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
            <ShopOwnerItems />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/orders"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
            <ShopOwnerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
            <ShopOwnerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/scan"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
            <ShopOwnerScan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/settings"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN', 'USER']}>
            <ShopOwnerSettings />
          </ProtectedRoute>
        }
      />

      {/* Shop Routes (Public browsing, protected checkout) */}
      <Route path="/shop" element={<ShopPage />} />
      <Route
        path="/shop/orders"
        element={
          <ProtectedRoute>
            <ShopOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/orders/:id"
        element={
          <ProtectedRoute>
            <ShopOrderDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Other Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-white/60 mb-6">Page not found</p>
      <a href="/" className="text-primary hover:underline">
        Go back home
      </a>
    </div>
  );
}

export default App;
