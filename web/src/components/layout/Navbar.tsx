import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Ticket, User, LogOut, Calendar, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PassAddis</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/events"
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            <Link
              to="/shop"
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop
            </Link>
            {isAuthenticated && (
              <Link
                to="/tickets"
                className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                My Tickets
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signin?mode=register"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'md:hidden transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-4 bg-dark-card border-t border-white/10">
          <Link
            to="/events"
            className="block text-white/70 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Events
          </Link>
          <Link
            to="/shop"
            className="block text-white/70 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Shop
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/tickets"
                className="block text-white/70 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Tickets
              </Link>
              <Link
                to="/profile"
                className="block text-white/70 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block text-white/70 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="block text-white/70 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signin?mode=register"
                className="block bg-primary text-white px-4 py-2 rounded-lg text-center"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
