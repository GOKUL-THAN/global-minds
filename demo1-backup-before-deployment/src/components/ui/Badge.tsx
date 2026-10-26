import { cn } from '../../utils/cn';

type BadgeVariant = 'brand' | 'accent' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand:  'bg-brand-50 text-brand-700',
  accent: 'bg-accent-50 text-accent-700',
  green:  'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  red:    'bg-red-50 text-red-700',
  yellow: 'bg-amber-50 text-amber-700',
  gray:   'bg-surface-100 text-surface-600',
};

export function Badge({ children, variant = 'brand', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  );
}
