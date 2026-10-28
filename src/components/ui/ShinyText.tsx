import React from 'react';
import { cn } from '../../utils/cn';

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shinyColor?: string;
}

/**
 * Shimmering metallic sheen text effect from React Bits
 */
export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 4,
  className = '',
  shinyColor = 'rgba(255, 255, 255, 0.95)',
}) => {
  return (
    <span
      className={cn(
        'inline-block bg-clip-text',
        !disabled && 'animate-shimmer',
        className
      )}
      style={{
        backgroundImage: `linear-gradient(120deg, currentColor 0%, currentColor 35%, ${shinyColor} 50%, currentColor 65%, currentColor 100%)`,
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: `${speed}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;

