import { useState, useRef, type MouseEvent, type ReactNode } from 'react';

interface ChromaCardProps {
  children: ReactNode;
  className?: string;
}

export function ChromaCard({ children, className = '' }: ChromaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl p-[1.5px] transition-all duration-300 ${className}`}
      style={{
        background: isHovered
          ? `radial-gradient(circle 260px at ${coords.x}% ${coords.y}%, rgba(13, 148, 136, 0.8), rgba(99, 102, 241, 0.6), rgba(244, 63, 94, 0.4), transparent 70%)`
          : 'rgba(229, 231, 235, 0.8)',
      }}
    >
      <div className="relative h-full w-full rounded-[15px] bg-white p-6 shadow-sm transition-shadow group-hover:shadow-card-xl">
        {children}
      </div>
    </div>
  );
}

