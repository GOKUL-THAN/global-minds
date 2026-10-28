import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || shouldReduceMotion || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });

    const observed = new WeakSet<HTMLElement>();
    const targetSelector = 'section:not(.home-hero), article, .grid, tbody tr';
    const registerTarget = (target: HTMLElement) => {
      if (observed.has(target)) return;
      observed.add(target);

      if (target.matches('tbody tr')) {
        target.classList.add('reactbits-table-row');
      } else if (target.classList.contains('grid')) {
        target.classList.add('reactbits-reveal-grid');
        Array.from(target.children).forEach(item => {
          if (item instanceof HTMLElement && !item.matches(targetSelector)) {
            item.classList.add('reactbits-stagger-item');
          }
        });
      } else {
        target.classList.add('reactbits-reveal');
      }
      observer.observe(target);
    };

    const registerTree = (node: Node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches(targetSelector)) registerTarget(node);
      node.querySelectorAll<HTMLElement>(targetSelector).forEach(registerTarget);

      const parentGrid = node.parentElement;
      if (parentGrid?.classList.contains('grid') && node instanceof HTMLElement
        && !node.matches(targetSelector)) {
        node.classList.add('reactbits-stagger-item');
      }
    };

    content.querySelectorAll<HTMLElement>(targetSelector).forEach(registerTarget);
    const mutations = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(registerTree));
    });
    mutations.observe(content, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [location.pathname, location.search, shouldReduceMotion]);

  return (
    <motion.div
      ref={contentRef}
      className={className}
      key={`${location.pathname}${location.search}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
