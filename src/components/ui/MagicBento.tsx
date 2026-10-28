import React from 'react';
import { cn } from '../../utils/cn';
import { SpotlightCard } from './SpotlightCard';

export interface BentoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  tag?: string;
  badge?: string;
  className?: string;
  headerGraphic?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}

/**
 * Bento card item with reactive spotlight effect
 */
export function BentoCard({
  title,
  description,
  icon,
  tag,
  badge,
  className = '',
  headerGraphic,
  footer,
  onClick,
}: BentoCardProps) {
  return (
    <SpotlightCard className={cn('h-full', className)}>
      <div
        onClick={onClick}
        className="group relative flex flex-col justify-between h-full p-6 sm:p-7 rounded-3xl bg-white border border-surface-200 hover:border-brand-300 hover:shadow-card-lg transition-all duration-300"
      >
        <div>
          {headerGraphic && <div className="mb-5 overflow-hidden rounded-2xl">{headerGraphic}</div>}
          <div className="flex items-center justify-between gap-3 mb-4">
            {icon && (
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                {icon}
              </div>
            )}
            {badge && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-100 text-surface-700">
                {badge}
              </span>
            )}
          </div>
          {tag && <p className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1.5">{tag}</p>}
          <h3 className="font-display font-bold text-lg text-surface-900 group-hover:text-brand-700 transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-surface-600 leading-relaxed font-medium">{description}</p>
        </div>
        {footer && <div className="mt-6 pt-4 border-t border-surface-100">{footer}</div>}
      </div>
    </SpotlightCard>
  );
}

export interface MagicBentoProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive Magic Bento Grid layout container from React Bits
 */
export const MagicBento: React.FC<MagicBentoProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {children}
    </div>
  );
};

export default MagicBento;

