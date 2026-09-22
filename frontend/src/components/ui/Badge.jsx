import { cn } from '../../utils/cn';

export function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
    underReview: 'bg-blue-50 text-blue-700',
    settled: 'bg-purple-50 text-purple-700',
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}