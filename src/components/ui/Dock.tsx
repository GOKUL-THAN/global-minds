import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  mouseX?: MotionValue<number>;
}

export function DockItem({
  icon,
  label,
  onClick,
  href,
  className = '',
  mouseX,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const fallback = useMotionValue(Infinity);
  const mouseValue = mouseX || fallback;

  const distance = useTransform(mouseValue, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-140, 0, 140], [44, 68, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 160, damping: 14 });

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className={cn(
        'group relative flex items-center justify-center rounded-2xl bg-white/80 dark:bg-surface-800/80 backdrop-blur-md shadow-card-md border border-white/40 dark:border-surface-700 hover:shadow-card-xl hover:border-brand-400 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <span className="text-surface-700 dark:text-surface-200 group-hover:text-brand-600 transition-colors">
        {icon}
      </span>
      {/* Tooltip */}
      <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-150 rounded-md bg-surface-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block outline-none">
        {content}
      </a>
    );
  }

  return <button className="inline-block outline-none bg-transparent border-0 p-0">{content}</button>;
}

export interface DockProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
  }>;
  className?: string;
}

export const Dock: React.FC<DockProps> = ({ items, className = '' }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'flex items-end gap-3 rounded-3xl bg-surface-100/60 dark:bg-surface-900/60 backdrop-blur-xl p-3 border border-white/20 dark:border-surface-800 shadow-2xl',
        className
      )}
    >
      {items.map((item, idx) => (
        <DockItem key={idx} {...item} mouseX={mouseX} />
      ))}
    </div>
  );
};

export default Dock;
