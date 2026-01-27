import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Ticket, User, LogOut, Calendar, ShoppingBag, LayoutDashboard, Building2, Store, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  // Get primary dashboard link based on role - only ONE main dashboard per role
  const getPrimaryDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return { path: '/admin', label: 'Admin Panel', icon: LayoutDashboard };
      case 'ORGANIZER':
        return { path: '/organizer', label: 'Dashboard', icon: Building2 };
      case 'SHOP_OWNER':
        return { path: '/shop-owner', label: 'Dashboard', icon: Store };
      default:
        return null; // Regular users don't see a dashboard link
    }
  };

  const primaryDashboard = getPrimaryDashboard();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/PassAddis_Logo_white.png"
              alt="PassAddis"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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
            {isAuthenticated && primaryDashboard && (
              <Link
                to={primaryDashboard.path}
                className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
              >
                <primaryDashboard.icon className="w-4 h-4" />
                {primaryDashboard.label}
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className={clsx('w-4 h-4 text-white/60 transition-transform', showUserMenu && 'rotate-180')} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-white font-medium truncate">{user?.name}</p>
                      <p className="text-white/50 text-xs truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/tickets"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Ticket className="w-4 h-4" />
                        My Tickets
                      </Link>
                      {primaryDashboard && (
                        <Link
                          to={primaryDashboard.path}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <primaryDashboard.icon className="w-4 h-4" />
                          {primaryDashboard.label}
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-white/70 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signin?mode=register"
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg transition-colors font-medium"
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
              {primaryDashboard && (
                <Link
                  to={primaryDashboard.path}
                  className="block text-white/70 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {primaryDashboard.label}
                </Link>
              )}
              <Link
                to="/profile"
                className="block text-white/70 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <div className="border-t border-white/10 pt-4 mt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
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
