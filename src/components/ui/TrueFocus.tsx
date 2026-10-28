import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
}

/**
 * Interactive focus snapping box from React Bits
 */
export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'Empowering Futures Through Practical Tech Education',
  manualMode = false,
  blurAmount = 3,
  borderColor = '#176c73',
  glowColor = 'rgba(23, 108, 115, 0.35)',
  animationDuration = 0.4,
  pauseBetweenAnimations = 1.4,
  className = '',
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);

      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex]!.getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    });
  }, [currentIndex, words.length]);

  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex ?? 0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative flex flex-wrap gap-2.5 items-center justify-center p-2', className)}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => (wordRefs.current[index] = el)}
            className="relative cursor-pointer transition-all duration-300 select-none font-bold text-surface-900"
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.45,
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="absolute pointer-events-none rounded-lg border-2 box-border"
        animate={{
          x: focusRect.x - 6,
          y: focusRect.y - 3,
          width: focusRect.width + 12,
          height: focusRect.height + 6,
          opacity: currentIndex >= 0 ? 1 : 0,
        }}
        transition={{
          duration: animationDuration,
          ease: 'easeInOut',
        }}
        style={{
          borderColor,
          boxShadow: `0 0 16px ${glowColor}`,
        }}
      >
        <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-brand-500" />
        <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-brand-500" />
        <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-brand-500" />
        <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-brand-500" />
      </motion.div>
    </div>
  );
};

export default TrueFocus;

