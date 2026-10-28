import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  tabClassName?: string;
}

/**
 * Smooth sliding spring pill tabs from React Bits
 */
export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  tabClassName = '',
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1.5 p-1.5 bg-surface-100 rounded-2xl border border-surface-200/80',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 z-10 outline-none',
              isActive ? 'text-brand-900 font-bold' : 'text-surface-600 hover:text-surface-900 font-medium',
              tabClassName
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-white rounded-xl shadow-card border border-surface-200/60 -z-10"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
              />
            )}
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                  isActive ? 'bg-brand-100 text-brand-800' : 'bg-surface-200 text-surface-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AnimatedTabs;

