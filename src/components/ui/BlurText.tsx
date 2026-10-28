import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
}

/**
 * Blur-to-focus staggered reveal from React Bits
 */
export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 45,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '-30px',
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: rootMargin as any, amount: threshold });

  const defaultFrom = direction === 'top' ? -18 : 18;

  return (
    <p ref={ref} className={cn('flex flex-wrap', className)}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={{ filter: 'blur(10px)', opacity: 0, y: defaultFrom }}
          animate={
            inView
              ? { filter: 'blur(0px)', opacity: 1, y: 0 }
              : { filter: 'blur(10px)', opacity: 0, y: defaultFrom }
          }
          transition={{
            duration: 0.45,
            delay: (index * delay) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
          className="inline-block"
        >
          {element === ' ' ? '\u00A0' : element}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText;

