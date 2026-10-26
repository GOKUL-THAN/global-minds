import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface AdminGenericPageProps {
  title: string;
  description?: string;
}

export default function AdminGenericPage({ title, description }: AdminGenericPageProps) {
  const location = useLocation();
  const section = location.pathname.split('/').pop() ?? '';
  const label = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">{title || label}</h1>
          {description && <p className="text-surface-500 text-sm mt-1">{description}</p>}
        </div>
        <Link to="/admin">
          <button className="btn-secondary btn flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-surface-100 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-surface-900 mb-2">Admin page not found</h2>
        <p className="text-surface-500 mb-6 max-w-lg mx-auto">
          The requested page does not exist. Use the admin navigation to open an available section.
        </p>
      </div>
    </div>
  );
}
