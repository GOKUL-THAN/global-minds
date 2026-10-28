import React, { useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  gridSize?: number;
  pixelColor?: string;
}

/**
 * Interactive pixel grid highlight card from React Bits
 */
export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  className = '',
  gridSize = 24,
  pixelColor = 'rgba(23, 108, 115, 0.22)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-surface-200 bg-white transition-all duration-300 hover:border-brand-300 hover:shadow-card-lg',
        className
      )}
    >
      {hoverPos && (
        <div
          className="pointer-events-none absolute inset-0 -z-0 opacity-100 transition-opacity duration-300"
          style={{
            backgroundImage: `radial-gradient(circle at ${hoverPos.x}px ${hoverPos.y}px, ${pixelColor} 0%, transparent 55%), radial-gradient(${pixelColor} 1px, transparent 1px)`,
            backgroundSize: `100% 100%, ${gridSize}px ${gridSize}px`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PixelCard;

