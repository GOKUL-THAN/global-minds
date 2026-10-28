import { type Transition, type Variants } from 'framer-motion';

/**
 * Global Minds × React Bits Combinatorial Motion System
 * Provides over 100,000+ deterministic, accessible visual and motion combinations
 * across typography, cards, sections, backgrounds, and interactive micro-states.
 */

export type MotionPreset = 'subtle' | 'gentle' | 'snappy' | 'bouncy' | 'dramatic' | 'editorial';
export type MotionDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade' | 'blur';
export type ThemeAccent = 'emerald' | 'amber' | 'cyan' | 'purple' | 'slate' | 'pearl';
export type CardVisualEffect = 'spotlight' | 'tilt' | 'pixel' | 'border-glow' | 'lift' | 'glass';
export type TextRevealType = 'decrypt' | 'shine' | 'blur' | 'split' | 'rotate' | 'true-focus';
export type BackgroundMesh = 'aurora' | 'grid' | 'dots' | 'mesh' | 'clean';
export type SpeedDuration = 'instant' | 'fast' | 'normal' | 'slow' | 'epic';

export interface MotionConfig {
  preset?: MotionPreset;
  direction?: MotionDirection;
  accent?: ThemeAccent;
  cardEffect?: CardVisualEffect;
  textReveal?: TextRevealType;
  background?: BackgroundMesh;
  duration?: SpeedDuration;
  delay?: number;
  stagger?: number;
  reduceMotion?: boolean;
}

// ── Cubic-bezier easing curves ─────────────────────────────────
export const EASINGS: Record<MotionPreset, [number, number, number, number]> = {
  subtle: [0.16, 1, 0.3, 1],
  gentle: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.2, 0.65, 0.3, 0.9],
  bouncy: [0.34, 1.56, 0.64, 1],
  dramatic: [0.77, 0, 0.175, 1],
  editorial: [0.22, 1, 0.36, 1],
};

// ── Duration scales in seconds ────────────────────────────────
export const DURATIONS: Record<SpeedDuration, number> = {
  instant: 0.15,
  fast: 0.28,
  normal: 0.45,
  slow: 0.75,
  epic: 1.2,
};

// ── Theme Accent palettes ──────────────────────────────────────
export const THEME_ACCENTS: Record<ThemeAccent, {
  primary: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
}> = {
  emerald: {
    primary: '#176c73',
    glow: 'rgba(23, 108, 115, 0.3)',
    badgeBg: '#edf8f7',
    badgeText: '#155861',
    borderHover: 'hover:border-brand-400',
  },
  amber: {
    primary: '#d9a10b',
    glow: 'rgba(217, 161, 11, 0.35)',
    badgeBg: '#fff9e6',
    badgeText: '#78350f',
    borderHover: 'hover:border-amber-400',
  },
  cyan: {
    primary: '#0891b2',
    glow: 'rgba(8, 145, 178, 0.3)',
    badgeBg: '#ecfeff',
    badgeText: '#155e75',
    borderHover: 'hover:border-cyan-400',
  },
  purple: {
    primary: '#7c3aed',
    glow: 'rgba(124, 58, 237, 0.3)',
    badgeBg: '#f5f3ff',
    badgeText: '#5b21b6',
    borderHover: 'hover:border-purple-400',
  },
  slate: {
    primary: '#475569',
    glow: 'rgba(71, 85, 105, 0.25)',
    badgeBg: '#f8fafc',
    badgeText: '#1e293b',
    borderHover: 'hover:border-slate-400',
  },
  pearl: {
    primary: '#102c33',
    glow: 'rgba(16, 44, 51, 0.2)',
    badgeBg: '#f1f5f9',
    badgeText: '#0f172a',
    borderHover: 'hover:border-brand-500',
  },
};

/**
 * Generate Framer Motion transition config based on options
 */
export function getTransition(config: MotionConfig = {}): Transition {
  const preset = config.preset ?? 'gentle';
  const durationKey = config.duration ?? 'normal';
  const delay = config.delay ?? 0;

  if (config.reduceMotion) {
    return { duration: 0, delay: 0 };
  }

  return {
    duration: DURATIONS[durationKey],
    delay,
    ease: EASINGS[preset],
  };
}

/**
 * Generate deterministic entrance variants for any container or item
 */
export function getEntranceVariants(config: MotionConfig = {}): Variants {
  const direction = config.direction ?? 'up';
  const transition = getTransition(config);

  if (config.reduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
    };
  }

  let offset = { x: 0, y: 0, scale: 1, filter: 'blur(0px)' };

  switch (direction) {
    case 'up':
      offset = { x: 0, y: 24, scale: 1, filter: 'blur(0px)' };
      break;
    case 'down':
      offset = { x: 0, y: -24, scale: 1, filter: 'blur(0px)' };
      break;
    case 'left':
      offset = { x: 24, y: 0, scale: 1, filter: 'blur(0px)' };
      break;
    case 'right':
      offset = { x: -24, y: 0, scale: 1, filter: 'blur(0px)' };
      break;
    case 'scale':
      offset = { x: 0, y: 0, scale: 0.94, filter: 'blur(0px)' };
      break;
    case 'blur':
      offset = { x: 0, y: 16, scale: 1, filter: 'blur(8px)' };
      break;
    case 'fade':
    default:
      offset = { x: 0, y: 0, scale: 1, filter: 'blur(0px)' };
      break;
  }

  return {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
      scale: offset.scale,
      filter: offset.filter,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition,
    },
  };
}

/**
 * Generate container stagger variants
 */
export function getStaggerContainerVariants(staggerInterval = 0.08, delayChildren = 0.05): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerInterval,
        delayChildren,
      },
    },
  };
}

