import { AlertTriangle } from 'lucide-react';

export function MockDataNotice({ children = 'Demo data only — these records are not real student or financial submissions.' }: { children?: string }) {
  return (
    <div role="note" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p><strong>Mock data:</strong> {children}</p>
    </div>
  );
}
