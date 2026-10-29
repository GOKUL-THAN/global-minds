import { useState, useRef, useCallback, type MouseEvent, type TouchEvent } from 'react';

interface ComparisonSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
  className?: string;
}

export function ComparisonSlider({
  beforeLabel = 'Before',
  afterLabel = 'After Global Minds',
  beforeContent,
  afterContent,
  className = '',
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isDragging) return;
    handleMove(event.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    handleMove(event.clientX);
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-surface-200 bg-surface-900 shadow-card-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* After content (full background) */}
      <div className="w-full h-full p-6 sm:p-8">
        {afterContent}
      </div>

      {/* Before content (clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden bg-surface-800 p-6 sm:p-8 transition-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {beforeContent}
      </div>

      {/* Floating Labels */}
      <div className="absolute top-4 left-4 z-20 rounded-full bg-surface-900/80 px-3 py-1 text-xs font-semibold text-surface-200 backdrop-blur-md">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 z-20 rounded-full bg-brand-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
        {afterLabel}
      </div>

      {/* Divider line & handle */}
      <div
        className="absolute top-0 bottom-0 z-30 w-1 cursor-ew-resize bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-surface-900 shadow-xl transition-transform active:scale-95">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

