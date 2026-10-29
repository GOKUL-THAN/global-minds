import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-12 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} className="mb-3" />
          <div className="page-hero-badge mb-3">
            <ShinyText text="Data Privacy & Trust" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title mb-2">
            Privacy <DecryptedText
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
        <div className="prose prose-sm max-w-none text-surface-700 space-y-6">
          <p className="text-base leading-relaxed text-surface-700">
            At Global Minds Technologies, we are committed to safeguarding your privacy and ensuring transparency in how your personal data is collected, processed, and secured when you use our website, enrollment portals, LMS, and training services.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when registering for programs, requesting free demo classes, contacting our admissions desk, or participating in webinars. This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contact details such as your full name, email address, mobile number, and city/country of residence.</li>
            <li>Educational background, years of professional experience, and target career goals.</li>
            <li>Course preferences, preferred learning mode (online, classroom, or hybrid), and batch timing choices.</li>
            <li>Billing records and transaction confirmation identifiers (card details are processed directly by RBI-authorized payment gateways and are never stored on our servers).</li>
          </ul>

          <h2 className="font-display font-bold text-xl text-surface-900">2. How We Use Your Information</h2>
          <p>We utilize the collected information strictly for legitimate academic and administrative purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Delivering live instruction, LMS courseware access, and hands-on lab sandbox provisioning.</li>
            <li>Sending batch schedules, timetable updates, assignment reviews, and certificate issuance notifications.</li>
            <li>Coordinating placement drives, resume forwarding to corporate hiring partners, and mock interviews.</li>
            <li>Improving our website performance, training curriculum relevance, and technical support responsiveness.</li>
          </ul>

          <h2 className="font-display font-bold text-xl text-surface-900">3. Data Sharing & Third Parties</h2>
          <p>
            Global Minds Technologies will never sell, lease, or monetize your personal information to third-party advertisers. Data is only shared with verified partners under strict data-protection agreements:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Accredited corporate recruitment partners when you opt in to placement assistance programs.</li>
            <li>Infrastructure service providers (cloud hosting, transactional email delivery, and SMS notifications).</li>
            <li>Statutory and regulatory bodies when mandatory under applicable Indian legislation.</li>
          </ul>

          <h2 className="font-display font-bold text-xl text-surface-900">4. Cookies & Web Analytics</h2>
          <p>
            We use essential session cookies to manage user logins and security preferences, as well as aggregated analytical cookies to understand page navigation and optimize load speeds. You can configure your browser to reject cookies, though certain interactive features may be limited.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">5. Data Security</h2>
          <p>
            We enforce industry-standard security safeguards including TLS 1.3 encryption in transit, strict role-based access control (RBAC), and automated vulnerability monitoring across our digital infrastructure to prevent unauthorized access or disclosure.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">6. Your Rights</h2>
          <p>
            You have the right to inspect, update, or request the deletion of your personal data stored with Global Minds Technologies. You may also unsubscribe from marketing notifications at any time by clicking the unsubscribe link in our emails.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">7. Contact Information</h2>
          <p>
            For privacy inquiries, data rectification, or grievance redressal, please contact our Data Governance Officer:
          </p>
          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-sm space-y-1">
            <p><strong>Global Minds Technologies</strong></p>
            <p>Email: <a href="mailto:connect@globalmindstechnologies.com" className="text-brand-600 underline">connect@globalmindstechnologies.com</a></p>
            <p>Phone: <a href="tel:+919597437333" className="text-brand-600 underline">+91 95974 37333</a></p>
            <p>Campus Address: Perumbakkam, Chennai, Tamil Nadu – 600100, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
