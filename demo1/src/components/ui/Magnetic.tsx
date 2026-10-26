import type { PointerEvent, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const moveChild = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const child = event.currentTarget.firstElementChild;
    if (!(child instanceof HTMLElement)) return;
    child.style.setProperty('--magnetic-x', `${(event.clientX - bounds.left - bounds.width / 2) * 0.12}px`);
    child.style.setProperty('--magnetic-y', `${(event.clientY - bounds.top - bounds.height / 2) * 0.12}px`);
  };

  const resetChild = (event: PointerEvent<HTMLDivElement>) => {
    const child = event.currentTarget.firstElementChild;
    if (!(child instanceof HTMLElement)) return;
    child.style.setProperty('--magnetic-x', '0px');
    child.style.setProperty('--magnetic-y', '0px');
  };

  return (
    <div className={cn('reactbits-magnetic', className)} onPointerMove={moveChild} onPointerLeave={resetChild}>
      {children}
    </div>
  );
}
