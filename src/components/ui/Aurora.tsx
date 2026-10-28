import React from 'react';
import { cn } from '../../utils/cn';

export interface AuroraProps {
  colorStops?: string[];
  className?: string;
  children?: React.ReactNode;
}

/**
 * Aurora ambient background glow effect from React Bits
 */
export const Aurora: React.FC<AuroraProps> = ({
  colorStops = ['#102c33', '#176c73', '#d9a10b', '#155861'],
  className = '',
  children,
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="absolute inset-0 pointer-events-none opacity-40 blur-[80px] -z-10 animate-pulse-slow"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 20% 30%, ${colorStops[0]} 0%, transparent 60%),
                       radial-gradient(ellipse 70% 60% at 80% 20%, ${colorStops[1]} 0%, transparent 70%),
                       radial-gradient(ellipse 60% 50% at 50% 80%, ${colorStops[2]} 0%, transparent 65%),
                       radial-gradient(ellipse 80% 70% at 90% 80%, ${colorStops[3]} 0%, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default Aurora;

