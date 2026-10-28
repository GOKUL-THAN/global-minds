import { cn } from '../../utils/cn';

type BadgeVariant = 'brand' | 'accent' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand:  'bg-brand-50 text-brand-800 border border-brand-200',
  accent: 'bg-accent-50 text-accent-700 border border-amber-200',
  green:  'bg-green-50 text-green-800 border border-green-200',
  purple: 'bg-purple-50 text-purple-800 border border-purple-200',
  red:    'bg-red-50 text-red-800 border border-red-200',
  yellow: 'bg-amber-50 text-amber-900 border border-amber-200',
  gray:   'bg-surface-100 text-surface-800 border border-surface-200',
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
