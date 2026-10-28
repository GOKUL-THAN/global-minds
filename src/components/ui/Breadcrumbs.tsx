import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center flex-wrap gap-1 text-sm', className)}>
      <Link to="/" className="text-surface-600 hover:text-brand-700 transition-colors flex items-center gap-1 font-medium">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-surface-500" aria-hidden="true" />
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="text-surface-600 hover:text-brand-700 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-surface-900 font-semibold" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
