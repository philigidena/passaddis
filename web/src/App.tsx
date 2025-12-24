import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { HomePage } from '@/pages/Home';
import { EventsPage } from '@/pages/Events';
import { EventDetailPage } from '@/pages/EventDetail';
import { SignInPage } from '@/pages/SignIn';
import { TicketsPage } from '@/pages/Tickets';
import { TicketDetailPage } from '@/pages/TicketDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            {/* TODO: Add more routes */}
            <Route path="/shop" element={<ComingSoon title="Shop" />} />
            <Route path="/profile" element={<ComingSoon title="Profile" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Placeholder components
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-white/60">Coming soon...</p>
      <a href="/" className="mt-6 text-primary hover:underline">
        Go back home
      </a>
    </div>
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
