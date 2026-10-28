import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-12 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Terms of Service' }]} className="mb-3" />
          <div className="page-hero-badge mb-3">Legal &amp; Compliance</div>
          <h1 className="page-hero-title mb-2">Terms of <span className="page-hero-highlight">Service</span></h1>
          <p className="text-surface-600 font-semibold text-sm">Last updated: October 2026</p>
        </div>
      </div>
      <div className="container-xl py-12 max-w-3xl">
        <div className="prose text-surface-700 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong>Note:</strong> Placeholder terms of service. Must be reviewed by a qualified legal professional before publication.
          </div>

          <h2 className="font-display font-bold text-xl">1. Acceptance of Terms</h2>
          <p>By accessing or using Global Minds Academy's website and services, you agree to be bound by these Terms of Service. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">2. Course Enrollment</h2>
          <p>Course enrollment is subject to availability and payment of applicable fees. Details are confirmed upon registration. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">3. Intellectual Property</h2>
          <p>All course materials, videos, and content are the intellectual property of Global Minds Academy and may not be reproduced without permission. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">4. User Conduct</h2>
          <p>Users agree to use our platform for lawful purposes only and not to share course materials with unauthorised third parties. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">5. Limitation of Liability</h2>
          <p>Global Minds Academy is not liable for any indirect, incidental, or consequential damages arising from use of our services. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">6. Contact</h2>
          <p>For terms-related queries: [EMAIL — PLACEHOLDER]</p>
        </div>
      </div>
    </div>
  );
}
