import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationFrom?: { opacity: number; transform: string };
  animationTo?: { opacity: number; transform: string };
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * Character-level spring slide animation from React Bits
 */
export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 25,
  animationFrom = { opacity: 0, transform: 'translate3d(0, 24px, 0)' },
  animationTo = { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  threshold = 0.15,
  rootMargin = '-30px',
  textAlign = 'left',
}) => {
  const letters = text.split('');
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: rootMargin as any, amount: threshold });

  return (
    <p
      ref={ref}
      style={{ textAlign }}
      className={cn('inline-block overflow-hidden', className)}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={animationFrom}
          animate={inView ? animationTo : animationFrom}
          transition={{
            duration: 0.45,
            delay: (index * delay) / 1000,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="inline-block will-change-transform"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </p>
  );
};

export default SplitText;

