import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';

const styles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-primary-500 text-white',
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function Toaster() {
  const { toasts } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-2 px-4 py-3 rounded-xl shadow-xl animate-slide-up text-sm font-medium',
              styles[toast.type] || styles.info
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
