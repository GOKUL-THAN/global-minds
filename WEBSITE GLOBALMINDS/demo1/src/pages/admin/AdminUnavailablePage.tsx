import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUnavailablePage() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
        <AlertTriangle className="h-7 w-7 text-amber-600" />
      </div>
      <h1 className="font-display text-2xl font-bold text-surface-900">This admin module is not connected</h1>
      <p className="mt-2 text-sm text-surface-600">
        Live records and a secure save workflow are not available for this module yet. Sample data and local-only edits are disabled here.
      </p>
      <Link to="/admin" className="btn-primary btn mt-5 inline-flex">
        Return to admin home
      </Link>
    </div>
  );
}
