import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-dark-card hover:bg-dark-card/80 text-white border border-white/10 focus:ring-white/20',
    outline: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5 focus:ring-white/20',
    danger: 'bg-danger hover:bg-danger/80 text-white focus:ring-danger',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
