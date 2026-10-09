import { globalFAQs } from '../../data/faqs';
import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

export default function AdminFAQsPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">FAQs</h1>
          <p className="text-surface-500 text-sm mt-0.5">{globalFAQs.length} FAQs (placeholder data)</p>
        </div>
        <button className="btn-primary btn flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-100 divide-y divide-surface-100">
        {globalFAQs.map(faq => (
          <div key={faq.id}>
            <button
              onClick={() => setOpen(open === faq.id ? null : faq.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-surface-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">{faq.category}</span>
                <span className="font-medium text-surface-900 text-sm">{faq.question}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-400 flex-shrink-0 transition-transform ${open === faq.id ? 'rotate-180' : ''}`} />
            </button>
            {open === faq.id && (
              <div className="px-5 pb-4 border-t border-surface-100 bg-surface-50">
                <p className="text-sm text-surface-600 pt-3 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
