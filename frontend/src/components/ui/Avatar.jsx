import { User } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Avatar({ src, alt, name, size = 'md', className }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium overflow-hidden',
        sizes[size],
        className
      )}
      role="img"
      aria-label={alt || name || 'User avatar'}
    >
      {src ? (
        <img src={src} alt={alt || name || 'User'} className="w-full h-full object-cover" />
      ) : (
        <User className="w-full h-full" />
      )}
      {!src && name && <span className="absolute inset-0 flex items-center justify-center">{getInitials(name)}</span>}
    </div>
  );
}