import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShinyText } from '../ui/ShinyText';

const faqs = [
  {
    question: 'What courses are available?',
    answer: 'AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing.',
  },
  {
    question: 'How many hiring partners does Global Minds Academy have?',
    answer: 'Global Minds Academy has 50+ hiring partners.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section bg-white" aria-label="Frequently asked questions">
      <div className="container-xl">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm text-brand-700 font-bold uppercase tracking-wider mb-3">
              <ShinyText text="❓ Common questions" shinyColor="rgba(23, 108, 115, 0.9)" />
            </p>
            <h2 className="display-md">
              Frequently Asked{' '}
              <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-surface-700 font-medium mt-4 max-w-xl mx-auto">
              Course areas and hiring-partner information.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <SpotlightCard key={index} className="rounded-2xl">
                  <div
                    className={cn(
                      'rounded-2xl border transition-all duration-200',
                      isOpen
                        ? 'border-brand-200 bg-brand-50/30 shadow-sm'
                        : 'border-surface-200 bg-white hover:border-surface-300',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className={cn(
                        'font-semibold text-sm transition-colors',
                        isOpen ? 'text-brand-700' : 'text-surface-900',
                      )}>
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 shrink-0 transition-transform duration-200',
                          isOpen ? 'rotate-180 text-brand-600' : 'text-surface-600',
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 -mt-1">
                        <p className="text-sm text-surface-700 font-medium leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
