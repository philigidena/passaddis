import { type ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      iconBg: 'bg-red-500/20',
      confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      iconBg: 'bg-yellow-500/20',
      confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-400" />,
      iconBg: 'bg-blue-500/20',
      confirmBtn: 'bg-primary hover:bg-primary-dark text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div
        className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md shadow-2xl"
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={clsx('p-3 rounded-full', styles.iconBg)}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <div className="text-gray-400 text-sm">{message}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              'flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2',
              styles.confirmBtn
            )}
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin\" fill="none\" viewBox="0 0 24 24">
                <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                <path className="opacity-75\" fill="currentColor\" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
