import type { PointerEvent, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
}

export function SpotlightCard({ children, className, onPointerMove, ...props }: SpotlightCardProps) {
  const updateSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`);
    onPointerMove?.(event);
  };

  return (
    <div className={cn('reactbits-spotlight', className)} onPointerMove={updateSpotlight} {...props}>
      {children}
    </div>
  );
}
