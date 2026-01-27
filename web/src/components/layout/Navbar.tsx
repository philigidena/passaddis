import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Calendar, ShoppingBag, LayoutDashboard, Building2, Store, ChevronDown, Ticket } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Get primary dashboard link based on role
  const getPrimaryDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return { path: '/admin', label: 'Admin', icon: LayoutDashboard };
      case 'ORGANIZER':
        return { path: '/organizer', label: 'Dashboard', icon: Building2 };
      case 'SHOP_OWNER':
        return { path: '/shop-owner', label: 'Dashboard', icon: Store };
      default:
        return null;
    }
  };

  const primaryDashboard = getPrimaryDashboard();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/shop', label: 'Shop', icon: ShoppingBag },
  ];

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-dark-bg/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/images/PassAddis_Logo_white.png"
              alt="PassAddis"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation - Glass Morphism Style */}
          <div className="hidden md:flex items-center">
            <div className={clsx(
              'flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-500',
              scrolled ? 'bg-white/[0.03]' : 'bg-white/[0.05] backdrop-blur-md border border-white/[0.08]'
            )}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                    isActive(link.path)
                      ? 'text-dark-bg bg-white'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </span>
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/tickets"
                  className={clsx(
                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                    isActive('/tickets')
                      ? 'text-dark-bg bg-white'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Tickets
                  </span>
                </Link>
              )}
              {isAuthenticated && primaryDashboard && (
                <Link
                  to={primaryDashboard.path}
                  className={clsx(
                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                    isActive(primaryDashboard.path)
                      ? 'text-dark-bg bg-white'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <primaryDashboard.icon className="w-4 h-4" />
                    {primaryDashboard.label}
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-300',
                    showUserMenu
                      ? 'bg-white/15 border-white/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10',
                    'border backdrop-blur-md'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className={clsx(
                    'w-4 h-4 text-white/60 transition-transform duration-300',
                    showUserMenu && 'rotate-180'
                  )} />
                </button>

                {/* Dropdown Menu */}
                <div className={clsx(
                  'absolute right-0 top-full mt-3 w-56 origin-top-right transition-all duration-300',
                  showUserMenu
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                )}>
                  <div className="bg-dark-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-gradient-to-br from-primary/10 to-transparent">
                      <p className="text-white font-semibold truncate">{user?.name}</p>
                      <p className="text-white/50 text-xs truncate mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-white/10 rounded-full text-white/60">
                        {user?.role?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile Settings</span>
                      </Link>
                      <Link
                        to="/tickets"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                      >
                        <Ticket className="w-4 h-4" />
                        <span className="text-sm">My Tickets</span>
                      </Link>
                      {primaryDashboard && (
                        <Link
                          to={primaryDashboard.path}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                          <primaryDashboard.icon className="w-4 h-4" />
                          <span className="text-sm">{primaryDashboard.label}</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="text-white/70 hover:text-white transition-all duration-300 px-5 py-2.5 rounded-full hover:bg-white/5 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signin?mode=register"
                  className="group relative bg-white text-dark-bg px-6 py-2.5 rounded-full transition-all duration-300 font-semibold text-sm overflow-hidden hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                    Get Started
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all duration-300 hover:bg-white/10"
          >
            <span className={clsx(
              'absolute transition-all duration-300',
              isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
            )}>
              <Menu className="w-5 h-5" />
            </span>
            <span className={clsx(
              'absolute transition-all duration-300',
              isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
            )}>
              <X className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'md:hidden transition-all duration-500 ease-out overflow-hidden',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-6 bg-dark-card/95 backdrop-blur-xl border-t border-white/5">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive(link.path)
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/tickets"
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive('/tickets')
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Ticket className="w-5 h-5" />
                  <span className="font-medium">My Tickets</span>
                </Link>
                {primaryDashboard && (
                  <Link
                    to={primaryDashboard.path}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive(primaryDashboard.path)
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <primaryDashboard.icon className="w-5 h-5" />
                    <span className="font-medium">{primaryDashboard.label}</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive('/profile')
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
                <div className="pt-4 mt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                <Link
                  to="/signin"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signin?mode=register"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-dark-bg font-semibold transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
