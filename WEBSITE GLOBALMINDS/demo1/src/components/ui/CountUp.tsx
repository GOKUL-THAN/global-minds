import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface CountUpProps {
  end: number;
  start: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function CountUp({ end, start, prefix = '', suffix = '', duration = 1200 }: CountUpProps) {
  const [value, setValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!start) return;
    if (shouldReduceMotion || duration <= 0) {
      setValue(end);
      return;
    }

    let frame = 0;
    let startTime: number | undefined;
    const animate = (timestamp: number) => {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.round(end * (1 - (1 - progress) ** 4)));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, end, shouldReduceMotion, start]);

  const formatted = new Intl.NumberFormat('en-IN').format(value);
  const accessibleValue = `${prefix}${new Intl.NumberFormat('en-IN').format(end)}${suffix}`;

  return <span aria-label={accessibleValue}>{prefix}{formatted}{suffix}</span>;
}
