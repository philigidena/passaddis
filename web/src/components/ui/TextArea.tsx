import type { TextareaHTMLAttributes } from 'react';
import { forwardRef, useState } from 'react';
import clsx from 'clsx';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'filled';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className, variant = 'default', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-2">
            {label}
            {props.required && <span className="text-primary ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          <textarea
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={clsx(
              'w-full rounded-xl text-white placeholder-white/30 transition-all duration-200 resize-none',
              'focus:outline-none min-h-[120px]',
              // Variant styles
              variant === 'default' && [
                'bg-dark-bg border-2 px-4 py-3.5',
                error
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-white/10 hover:border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20',
              ],
              variant === 'filled' && [
                'bg-white/5 border border-transparent px-4 py-3.5',
                error
                  ? 'border-red-500/50 focus:border-red-500 focus:bg-white/10'
                  : 'hover:bg-white/8 focus:bg-white/10 focus:border-primary/50',
              ],
              // Disabled state
              props.disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {/* Focus ring effect */}
          <div className={clsx(
            'absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200',
            isFocused && !error ? 'opacity-100' : 'opacity-0',
            'shadow-[0_0_0_4px_rgba(168,85,247,0.1)]'
          )} />
        </div>
        {/* Hint or Error text */}
        {(error || hint) && (
          <p className={clsx(
            'mt-2 text-sm',
            error ? 'text-red-400' : 'text-white/40'
          )}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
