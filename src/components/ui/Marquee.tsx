import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface MarqueeProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  speed?: number; // duration in seconds
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  direction = 'left',
  speed = 30,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex overflow-hidden p-2 select-none [--gap:1.5rem] [gap:var(--gap)]',
        className,
      )}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <div
        className={cn(
          'flex shrink-0 justify-around [gap:var(--gap)]',
          direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'flex shrink-0 justify-around [gap:var(--gap)]',
          direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}

