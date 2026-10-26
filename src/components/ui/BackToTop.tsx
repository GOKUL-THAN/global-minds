import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-12 h-12 rounded-full bg-brand-600 text-white',
        'flex items-center justify-center shadow-glow',
        'hover:bg-brand-700 active:bg-brand-800',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
