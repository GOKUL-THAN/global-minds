import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { FAQ } from '../../types';

interface FAQAccordionProps {
  faqs: FAQ[];
  className?: string;
}

export function FAQAccordion({ faqs, className }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id));

  return (
    <div className={cn('space-y-3', className)}>
      {faqs.map(faq => (
        <div
          key={faq.id}
          className="border border-surface-200 rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => toggle(faq.id)}
            aria-expanded={openId === faq.id}
            className={cn(
              'w-full text-left flex items-center justify-between p-5 gap-4',
              'font-semibold text-surface-900 text-sm sm:text-base',
              'hover:bg-surface-50 transition-colors duration-200',
              openId === faq.id && 'bg-brand-50/50',
            )}
          >
            <span>{faq.question}</span>
            <ChevronDown
              className={cn(
                'w-5 h-5 flex-shrink-0 text-brand-500 transition-transform duration-300',
                openId === faq.id && 'rotate-180',
              )}
            />
          </button>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              openId === faq.id ? 'max-h-96' : 'max-h-0',
            )}
          >
            <div className="px-5 pb-5 text-sm text-surface-600 leading-relaxed border-t border-surface-100">
              <div className="pt-4">{faq.answer}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
