import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  accentColor?: string;
}

export function DashboardLayout({
  children,
  title,
  navItems,
  accentColor = 'primary',
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold text-white">{title}</span>
          <Link to="/" className="text-primary hover:text-primary/80">
            Exit
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 border-r border-gray-700
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-700">
            <div className={`w-8 h-8 rounded-lg bg-${accentColor} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">PA</span>
            </div>
            <span className="font-bold text-white">{title}</span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? `bg-${accentColor}/20 text-${accentColor}`
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || user?.phone}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/"
                className="flex-1 px-3 py-2 text-sm text-center text-gray-400 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 text-sm text-center text-red-400 hover:text-red-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg bg-${color}/20 text-${color}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Table Component
export function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
}: {
  columns: { key: string; label: string; render?: (value: any, row: any) => ReactNode }[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 text-sm font-medium text-gray-400"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b border-gray-700/50
                ${onRowClick ? 'cursor-pointer hover:bg-gray-700/50' : ''}
              `}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-4 px-4 text-sm text-gray-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Status Badge Component
export function StatusBadge({
  status,
  variant = 'default',
}: {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}) {
  const colors = {
    default: 'bg-gray-600 text-gray-200',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[variant]}`}>
      {status}
    </span>
  );
}

// Button Component
export function DashboardButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700',
    outline: 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </button>
  );
}
