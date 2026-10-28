import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-12 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} className="mb-3" />
          <div className="page-hero-badge mb-3">Data Privacy &amp; Trust</div>
          <h1 className="page-hero-title mb-2">Privacy <span className="page-hero-highlight">Policy</span></h1>
          <p className="text-surface-600 font-semibold text-sm">Last updated: October 2026</p>
        </div>
      </div>
      <div className="container-xl py-12 max-w-3xl">
        <div className="prose prose-sm max-w-none text-surface-700 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong>Note:</strong> This is placeholder privacy policy content. This document must be reviewed and approved by a qualified legal professional before publication. Replace all [PLACEHOLDER] sections with actual business information.
          </div>

          <h2 className="font-display font-bold text-xl">1. Information We Collect</h2>
          <p>We collect information you provide when registering, enrolling in courses, or contacting us. This includes: name, email address, phone number, country, educational background, and course preferences. [PLACEHOLDER — add complete list]</p>

          <h2 className="font-display font-bold text-xl">2. How We Use Your Information</h2>
          <p>We use the information collected to provide and improve our services, communicate about courses, send administrative notifications, and personalise your learning experience. [PLACEHOLDER — complete details required]</p>

          <h2 className="font-display font-bold text-xl">3. Data Sharing</h2>
          <p>We do not sell or rent your personal information to third parties. We may share information with service providers who assist in our operations, subject to confidentiality agreements. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">4. Cookies</h2>
          <p>We use cookies to enhance your experience on our website. You can control cookie settings through your browser preferences. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">5. Data Security</h2>
          <p>We implement appropriate security measures to protect your information. However, no transmission over the internet is completely secure. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us at [EMAIL — PLACEHOLDER] to exercise these rights. [PLACEHOLDER]</p>

          <h2 className="font-display font-bold text-xl">7. Contact</h2>
          <p>For privacy-related queries, contact us at: [EMAIL — PLACEHOLDER] [ADDRESS — PLACEHOLDER]</p>
        </div>
      </div>
    </div>
  );
}
