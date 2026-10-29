import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-12 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Terms of Service' }]} className="mb-3" />
          <div className="page-hero-badge mb-3">
            <ShinyText text="Legal & Compliance" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title mb-2">
            Terms of <DecryptedText
              text="Service"
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
        <div className="prose text-surface-700 space-y-6">
          <p className="text-base leading-relaxed text-surface-700">
            Welcome to Global Minds Technologies. By visiting our website, signing up for demo sessions, or enrolling in our professional certifications and Master Programs, you agree to be bound by the following terms and conditions.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">1. Acceptance of Terms</h2>
          <p>
            These Terms of Service govern your access to and use of all websites, student portals, learning materials, and live training sessions provided by Global Minds Technologies. If you do not agree to these terms, please refrain from using our platforms.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">2. Program Enrollment & Admissions</h2>
          <p>
            Admission to specific training cohorts, internship slots, and Master Programs is subject to prerequisite eligibility verification and seat availability. Enrollment is confirmed only upon successful receipt of the designated program fees or approved institutional sponsorship.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">3. Intellectual Property Rights</h2>
          <p>
            All training curricula, slide presentations, recorded video lectures, laboratory architecture blueprints, code repositories, and assessments provided during courses are the proprietary intellectual property of Global Minds Technologies. Enrolled students are granted a personal, non-transferable license to access the materials solely for personal educational purposes. Redistribution or commercial resale is strictly prohibited.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">4. Code of Conduct</h2>
          <p>
            Learners agree to engage professionally and respectfully during live mentor sessions, collaborative code reviews, and community channels. Any harassment, disruptive conduct, academic dishonesty, or unauthorized recording of live sessions will result in immediate termination of portal access without refund.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">5. Placement Assistance & Career Support</h2>
          <p>
            Global Minds Technologies provides comprehensive placement assistance—including resume reviews, mock interviews, and direct interviews with our network of 50+ hiring partners. Final job offers and salary packages depend entirely on candidate interview performance, technical assessment scores, and the hiring criteria of employer partners.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">6. Limitation of Liability</h2>
          <p>
            Global Minds Technologies shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime, internet disruptions, third-party certification vendor policy modifications, or independent employer hiring decisions.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">7. Governing Law & Jurisdiction</h2>
          <p>
            These terms shall be interpreted in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
          </p>

          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-sm space-y-1">
            <p><strong>Contact Admissions & Administration:</strong></p>
            <p>Email: <a href="mailto:connect@globalmindstechnologies.com" className="text-brand-600 underline">connect@globalmindstechnologies.com</a></p>
            <p>Phone: <a href="tel:+919597437333" className="text-brand-600 underline">+91 95974 37333</a></p>
            <p>Address: Perumbakkam, Chennai, Tamil Nadu – 600100, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
