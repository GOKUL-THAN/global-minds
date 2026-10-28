import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-12 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Refund Policy' }]} className="mb-3" />
          <div className="page-hero-badge mb-3">Transparency &amp; Guarantee</div>
          <h1 className="page-hero-title mb-2">Refund <span className="page-hero-highlight">Policy</span></h1>
          <p className="text-surface-600 font-semibold text-sm">Last updated: October 2026</p>
        </div>
      </div>
      <div className="container-xl py-12 max-w-3xl">
        <div className="text-surface-700 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong>Note:</strong> This is a placeholder refund policy. Must be reviewed and approved by management and legal counsel before publication.
          </div>

          <h2 className="font-display font-bold text-xl">Refund Eligibility</h2>
          <p className="text-sm leading-relaxed">Refund eligibility and timelines are determined on a case-by-case basis. Please contact our admissions team with your refund request. [PLACEHOLDER — add specific refund terms, timelines, and conditions]</p>

          <h2 className="font-display font-bold text-xl">How to Request a Refund</h2>
          <p className="text-sm">To request a refund, contact us at <strong>[EMAIL — PLACEHOLDER]</strong> or call <strong>[PHONE — PLACEHOLDER]</strong> within the applicable refund window. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">Non-Refundable Items</h2>
          <p className="text-sm">[PLACEHOLDER — specify items not eligible for refund such as downloadable materials, certification fees, etc.]</p>

          <h2 className="font-display font-bold text-xl">Processing Time</h2>
          <p className="text-sm">Approved refunds are processed within [X business days — PLACEHOLDER].</p>

          <h2 className="font-display font-bold text-xl">Contact Us</h2>
          <p className="text-sm">Email: [EMAIL — PLACEHOLDER] | Phone: [PHONE — PLACEHOLDER]</p>
        </div>
      </div>
    </div>
  );
}
