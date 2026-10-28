import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-12 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Cookie Policy' }]} className="mb-3" />
          <div className="page-hero-badge mb-3">
            <ShinyText text="Privacy & Cookie Compliance" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title mb-2">
            Cookie <DecryptedText
              text="Policy"
              speed={40}
              maxIterations={15}
              sequential={true}
              revealDirection="start"
              className="page-hero-highlight"
            />
          </h1>
          <p className="text-surface-600 font-semibold text-sm">Last updated: October 2026</p>
        </div>
      </div>
      <div className="container-xl py-12 max-w-3xl">
        <div className="text-surface-700 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong>Note:</strong> Placeholder cookie policy. Must be reviewed by legal counsel before publication.
          </div>
          <p className="text-sm leading-relaxed">Global Minds Academy uses cookies and similar technologies to enhance your experience on our website. [PLACEHOLDER — complete cookie policy details required]</p>
          <h2 className="font-display font-bold text-xl">Types of Cookies We Use</h2>
          <ul className="text-sm space-y-2">
            <li><strong>Essential cookies:</strong> Required for basic website functionality. [PLACEHOLDER]</li>
            <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site. [PLACEHOLDER]</li>
            <li><strong>Marketing cookies:</strong> Used to deliver relevant advertising. [PLACEHOLDER]</li>
          </ul>
          <h2 className="font-display font-bold text-xl">Managing Cookies</h2>
          <p className="text-sm">You can control and delete cookies through your browser settings. Note that disabling certain cookies may affect website functionality. [PLACEHOLDER]</p>
        </div>
      </div>
    </div>
  );
}
