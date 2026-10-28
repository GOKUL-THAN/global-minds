import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

export default function AdminUnavailablePage() {
  return (
    <SpotlightCard className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <AlertTriangle className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          <ShinyText text="This admin module is not connected" shinyColor="rgba(217, 119, 6, 0.9)" />
        </h1>
        <p className="mt-2 text-sm text-surface-600 font-medium">
          Live records and a secure save workflow are not available for this module yet. Sample data and local-only edits are disabled here.
        </p>
        <Link to="/admin" className="btn-primary btn mt-5 inline-flex">
          Return to admin home
        </Link>
      </div>
    </SpotlightCard>
  );
}
