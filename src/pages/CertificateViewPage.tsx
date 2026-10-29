import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, Loader2, Printer } from 'lucide-react';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { ShinyText } from '../components/ui/ShinyText';

type Certificate = {
  certificateId: string;
  courseName: string;
  issuedAt: string;
  studentName: string;
  valid: boolean;
  status: 'active' | 'revoked';
};

export default function CertificateViewPage() {
  const { certificateId = '' } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void fetch(`/api/certificates/verify/${encodeURIComponent(certificateId)}`)
      .then(async response => {
        const result = await response.json() as { success?: boolean; data?: Certificate; error?: { message?: string } };
        if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message ?? 'Certificate could not be verified.');
        if (active) setCertificate(result.data);
      })
      .catch(cause => {
        if (active) setError(cause instanceof Error ? cause.message : 'Certificate could not be verified.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [certificateId]);

  if (loading) return <main className="flex min-h-screen items-center justify-center text-surface-600"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying certificate...</main>;
  if (error || !certificate) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"><p role="alert" className="text-red-700">{error || 'Certificate not found.'}</p><Link className="text-brand-700 underline" to="/dashboard">Return to dashboard</Link></main>;

  return (
    <main className="min-h-screen bg-surface-50 p-4 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to="/dashboard" className="text-sm font-medium text-brand-700 hover:underline">Back to dashboard</Link>
          <button type="button" onClick={() => window.print()} className="btn-primary btn inline-flex items-center gap-2"><Printer className="h-4 w-4" /> Print / Save as PDF</button>
        </div>
        <SpotlightCard className={`border-8 bg-white p-8 text-center shadow-card sm:p-16 rounded-3xl ${certificate.valid ? 'border-brand-200' : 'border-red-200'}`}>
          <Award className={`mx-auto h-14 w-14 ${certificate.valid ? 'text-brand-600' : 'text-red-600'}`} />
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-surface-700">
            <ShinyText text="Global Minds Technologies" shinyColor="rgba(23, 108, 115, 0.9)" />
          </p>
          <h1 className="mt-5 font-display text-3xl font-bold text-surface-900 sm:text-5xl">Certificate of Achievement</h1>
          <p className="mt-8 text-surface-700 font-medium">This certifies that</p>
          <p className="mt-2 font-display text-3xl font-semibold text-brand-800">{certificate.studentName}</p>
          <p className="mt-6 text-surface-700 font-medium">has successfully completed</p>
          <p className="mt-2 text-2xl font-bold text-surface-900">{certificate.courseName}</p>
          <p className="mt-8 text-sm text-surface-600 font-medium">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p>
          <p className="mt-2 text-xs text-surface-600 font-medium">Certificate ID: {certificate.certificateId}</p>
          <p className={`mt-6 text-sm font-bold uppercase tracking-wide ${certificate.valid ? 'text-green-700' : 'text-red-700'}`}>{certificate.valid ? '✓ Verified and valid' : 'Revoked — not valid'}</p>
        </SpotlightCard>
      </div>
    </main>
  );
}
