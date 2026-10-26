import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Global toast state (simple approach)
let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null;

// eslint-disable-next-line react-refresh/only-export-components
export function toast(options: Omit<Toast, 'id'>) {
  addToastFn?.(options);
}

const icons = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
};

const colors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info:    'bg-brand-50 border-brand-200 text-brand-800',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-brand-500',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { id, duration: 5000, ...options };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);
  }, []);

  addToastFn = addToast;

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div
      className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl border shadow-card-lg animate-slide-up',
              colors[t.type],
            )}
            role="alert"
          >
            <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconColors[t.type])} />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
