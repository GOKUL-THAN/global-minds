import type { PointerEvent, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const updateSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`);
  };

  return (
    <div className={cn('reactbits-spotlight', className)} onPointerMove={updateSpotlight}>
      {children}
    </div>
  );
}
