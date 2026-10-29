import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-12 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Refund Policy' }]} className="mb-3" />
          <div className="page-hero-badge mb-3">
            <ShinyText text="Transparency & Guarantee" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title mb-2">
            Refund <DecryptedText
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
            At Global Minds Technologies, we stand behind the quality of our faculty, practical curriculum, and career support. We believe in transparent policies to ensure peace of mind when investing in your technical education.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">1. 7-Day Money-Back Guarantee (Course Enrollment)</h2>
          <p className="text-sm leading-relaxed">
            If you enroll in any individual course or Master Program and find within seven (7) days of your batch commencement date that the program does not meet your learning expectations, you may submit a formal cancellation request for a full refund (minus a nominal 3% administrative/payment gateway processing fee).
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">2. Refund Request Procedure</h2>
          <p className="text-sm leading-relaxed">
            To initiate an eligible refund, please send an email from your registered email address to <a href="mailto:globalminds.learn@gmail.com" className="text-brand-600 underline">globalminds.learn@gmail.com</a> with the subject line <em>&ldquo;Refund Request - [Student ID] - [Course Name]&rdquo;</em>. Our admissions committee will review your request within 2 business days.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">3. Non-Refundable Items & Exceptions</h2>
          <p className="text-sm leading-relaxed">
            The following fees and services are strictly non-refundable:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Requests submitted after 7 days from the designated batch start date.</li>
            <li>External third-party certification exam vouchers (e.g. AWS, Microsoft Azure, ISTQB, CompTIA) once purchased on your behalf.</li>
            <li>Corporate customized training cohorts where tailored syllabi or dedicated infrastructure has already been provisioned.</li>
            <li>Registration or seat reservation booking deposits if a student fails to attend the batch without prior written postponement notice.</li>
          </ul>

          <h2 className="font-display font-bold text-xl text-surface-900">4. Processing & Settlement Timeline</h2>
          <p className="text-sm leading-relaxed">
            Approved refunds will be processed and credited back to the original source payment method (bank account, UPI, or card) within 5 to 7 business days from the date of refund approval.
          </p>

          <h2 className="font-display font-bold text-xl text-surface-900">5. Batch Postponement / Transfer Option</h2>
          <p className="text-sm leading-relaxed">
            If personal, academic, or professional commitments prevent you from completing your active cohort, you can request a one-time free batch transfer to a future cohort within six (6) months, without forfeiting your enrollment fees.
          </p>

          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-sm space-y-1">
            <p><strong>Admissions & Accounts Desk:</strong></p>
            <p>Email: <a href="mailto:globalminds.learn@gmail.com" className="text-brand-600 underline">globalminds.learn@gmail.com</a></p>
            <p>Phone: <a href="tel:+919597437333" className="text-brand-600 underline">+91 95974 37333</a></p>
            <p>Global Minds Technologies, Perumbakkam, Chennai, Tamil Nadu – 600100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
