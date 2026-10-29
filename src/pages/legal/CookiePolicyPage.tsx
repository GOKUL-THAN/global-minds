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
          <p className="text-base leading-relaxed text-surface-700">
            Global Minds Technologies uses cookies, web beacons, and related browser storage technologies to provide an optimal browsing experience, safeguard user accounts, and understand how visitors engage with our courses and learning portals.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">What Are Cookies?</h2>
          <p className="text-sm leading-relaxed">
            Cookies are small text files placed on your computer or mobile device when you browse websites. They help the website remember your login sessions, course search preferences, and assist us in diagnosing navigation bottlenecks.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">Types of Cookies We Utilize</h2>
          <ul className="text-sm space-y-3">
            <li className="rounded-xl border border-surface-200 bg-surface-50 p-4">
              <strong>1. Strictly Necessary Cookies:</strong> Essential for foundational security and navigation. These enable authentication token persistence, protected route authorization, and shopping cart / checkout integrity.
            </li>
            <li className="rounded-xl border border-surface-200 bg-surface-50 p-4">
              <strong>2. Performance & Analytics Cookies:</strong> Gather anonymous, aggregated metrics on which pages are visited most often, average dwell times, and error log tracking. These insights allow us to optimize load times and UI responsiveness.
            </li>
            <li className="rounded-xl border border-surface-200 bg-surface-50 p-4">
              <strong>3. Functional Cookies:</strong> Remember your personalization settings, such as preferred dark/light contrast modes, course filter criteria, and notification preferences.
            </li>
          </ul>

          <h2 className="font-display font-bold text-xl text-surface-900">Managing & Disabling Cookies</h2>
          <p className="text-sm leading-relaxed">
            You can configure your browser preferences to alert you whenever a cookie is placed, or to decline all cookies entirely. Please be aware that blocking essential cookies may disrupt access to the student dashboard and authenticated course assessments.
          </p>

          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-sm space-y-1">
            <p><strong>Questions Regarding Cookies?</strong></p>
            <p>Email: <a href="mailto:globalminds.learn@gmail.com" className="text-brand-600 underline">globalminds.learn@gmail.com</a></p>
            <p>Global Minds Technologies, Perumbakkam, Chennai, Tamil Nadu – 600100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
