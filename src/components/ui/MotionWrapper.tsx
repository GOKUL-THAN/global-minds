import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  type MotionConfig,
  getEntranceVariants,
  getStaggerContainerVariants,
} from '../../utils/motionSystem';
import { cn } from '../../utils/cn';

export interface MotionItemProps extends MotionConfig {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof motion;
}

/**
 * Flexible motion element driven by the central motionSystem
 */
export const MotionItem: React.FC<MotionItemProps> = ({
  children,
  className = '',
  preset = 'gentle',
  direction = 'up',
  duration = 'normal',
  delay = 0,
  accent,
  reduceMotion: forceReduceMotion,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const reduce = forceReduceMotion ?? Boolean(shouldReduceMotion);

  const variants = getEntranceVariants({
    preset,
    direction,
    duration,
    delay,
    accent,
    reduceMotion: reduce,
  });

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export interface MotionContainerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}

/**
 * Stagger container wrapper
 */
export const MotionContainer: React.FC<MotionContainerProps> = ({
  children,
  className = '',
  stagger = 0.08,
  delayChildren = 0.05,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={getStaggerContainerVariants(stagger, delayChildren)}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default MotionItem;

