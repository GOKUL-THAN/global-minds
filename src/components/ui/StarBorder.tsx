import React from 'react';
import { cn } from '../../utils/cn';

export interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children?: React.ReactNode;
}

/**
 * Animated traveling light border from React Bits
 */
export const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = 'button',
  className = '',
  color = '#178589',
  speed = '4s',
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'relative inline-block py-[1px] px-[1px] overflow-hidden rounded-xl bg-transparent',
        className
      )}
      {...props}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-15%] right-[-100%] rounded-full animate-spin-slow pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color} 10%, transparent 80%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-15%] left-[-100%] rounded-full animate-spin-slow pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color} 10%, transparent 80%)`,
          animationDuration: speed,
          animationDirection: 'reverse',
        }}
      />
      <div className="relative z-[1] bg-white dark:bg-surface-900 rounded-[11px] h-full w-full">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;

