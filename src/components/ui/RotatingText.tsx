import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface RotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * Animated cycling text flip effect from React Bits
 */
export const RotatingText: React.FC<RotatingTextProps> = ({
  texts,
  interval = 2800,
  className = '',
  itemClassName = '',
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <span className={cn('relative inline-flex overflow-hidden align-top leading-tight py-0.5', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[index]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className={cn('inline-block whitespace-nowrap', itemClassName)}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RotatingText;

