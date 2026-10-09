import { useState } from 'react';
import { CheckCircle, CreditCard, Percent, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';

// ── Scholarship types ──────────────────────────────────────
const scholarships = [
  {
    id: 'merit',
    icon: '🏆',
    title: 'Merit Scholarship',
    discount: 'Up to 50% Off',
    badge: 'Most Popular',
    badgeColor: 'bg-brand-100 text-brand-700',
    description: 'For students who score 80% or above in our free skill assessment test. Rewards academic excellence.',
    eligibility: ['Score 80%+ in skill assessment', 'Any degree / diploma', 'Fresh enrollment only'],
    howToApply: 'Take the free skill assessment on our website. Qualifying scores automatically trigger a scholarship offer.',
    color: 'border-brand-200 bg-brand-50',
  },
  {
    id: 'fresher',
    icon: '🎓',
    title: 'Fresher / Student Scholarship',
    discount: '30% Off',
    badge: 'Freshers',
    badgeColor: 'bg-green-100 text-green-700',
    description: 'Exclusive discount for recent graduates and final year students entering the IT industry.',
    eligibility: ['Final year or recently graduated (within 1 year)', 'Valid college ID required', 'Any stream / degree'],
    howToApply: 'Apply online and upload your college ID or marksheet. Our team verifies within 24 hours.',
    color: 'border-green-200 bg-green-50',
  },
  {
    id: 'women',
    icon: '👩‍💻',
    title: 'Women in Tech Scholarship',
    discount: '40% Off',
    badge: 'Special Initiative',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'Supporting gender diversity in technology. Special discount for women professionals and students.',
    eligibility: ['Identifies as a woman', 'Any background — IT or non-IT', 'All courses eligible'],
    howToApply: 'Fill out the scholarship application form and mention "Women in Tech" in the comments.',
    color: 'border-purple-200 bg-purple-50',
  },
  {
    id: 'referral',
    icon: '🤝',
    title: 'Referral Discount',
    discount: '₹3,000 Off',
    badge: 'Refer & Save',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: 'Get ₹3,000 off your enrollment fee when referred by an existing or past student.',
    eligibility: ['Referred by a current or alumni student', 'Valid referral code required', 'Stackable with select offers'],
    howToApply: 'Get a referral code from your friend and enter it at checkout. Discount applied instantly.',
    color: 'border-orange-200 bg-orange-50',
  },
  {
    id: 'corporate',
    icon: '🏢',
    title: 'Group / Corporate Discount',
    discount: 'Up to 30% Off',
    badge: 'Teams',
    badgeColor: 'bg-sky-100 text-sky-700',
    description: 'Special pricing for companies enrolling 3 or more employees for upskilling programs.',
    eligibility: ['Minimum 3 employees enrolling together', 'Same or different courses', 'Invoice billing available'],
    howToApply: 'Contact our corporate team with the number of employees and preferred courses.',
    color: 'border-sky-200 bg-sky-50',
  },
  {
    id: 'early',
    icon: '⚡',
    title: 'Early Bird Offer',
    discount: '₹2,000 Off',
    badge: 'Limited Time',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    description: 'Enroll at least 15 days before a batch starts to get an early bird discount.',
    eligibility: ['Enroll 15+ days before batch start', 'Pay full fee upfront', 'All courses eligible'],
    howToApply: 'Select your batch on the batch schedule page. The early bird price is automatically shown for eligible batches.',
    color: 'border-yellow-200 bg-yellow-50',
  },
];

// ── Course Fee Table ───────────────────────────────────────
const courseFees = [
  { course: 'AWS Training', duration: '60 Hrs', fee: '₹18,999', emi: '₹3,166/mo', category: 'Cloud' },
  { course: 'DevOps Training', duration: '50 Hrs', fee: '₹16,999', emi: '₹2,833/mo', category: 'DevOps' },
  { course: 'Full Stack Development (MERN)', duration: '90 Hrs', fee: '₹22,999', emi: '₹3,833/mo', category: 'Full Stack' },
  { course: 'Data Science & AI', duration: '80 Hrs', fee: '₹24,999', emi: '₹4,166/mo', category: 'AI / ML' },
  { course: 'Python Training', duration: '45 Hrs', fee: '₹9,999', emi: '₹1,666/mo', category: 'Programming' },
  { course: 'Java Full Stack', duration: '100 Hrs', fee: '₹26,999', emi: '₹4,499/mo', category: 'Full Stack' },
  { course: 'Microsoft Azure', duration: '55 Hrs', fee: '₹17,999', emi: '₹2,999/mo', category: 'Cloud' },
  { course: 'Software Testing (Selenium)', duration: '40 Hrs', fee: '₹12,999', emi: '₹2,166/mo', category: 'QA' },
  { course: 'Generative AI', duration: '30 Hrs', fee: '₹9,999', emi: '₹1,666/mo', category: 'AI / ML' },
  { course: 'Cyber Security', duration: '45 Hrs', fee: '₹15,999', emi: '₹2,666/mo', category: 'Security' },
  { course: 'React JS + Next.js', duration: '45 Hrs', fee: '₹13,999', emi: '₹2,333/mo', category: 'Full Stack' },
  { course: 'Data Analytics + Power BI', duration: '40 Hrs', fee: '₹11,999', emi: '₹1,999/mo', category: 'Data & BI' },
];

// ── EMI Plans ─────────────────────────────────────────────
const emiPlans = [
  { months: 3, interest: '0%', note: 'Available on select credit cards' },
  { months: 6, interest: '0%', note: 'No-cost EMI via partner NBFCs' },
  { months: 12, interest: 'Low interest', note: 'Flexible repayment via partners' },
];

const emiPartners = ['🏦 Bajaj Finserv', '💳 HDFC Bank', '💳 ICICI Bank', '💳 Axis Bank', '🏦 ZestMoney', '🏦 Capital Float', '🏦 KreditBee'];

interface ApplicationForm {
  name: string;
  email: string;
  phone: string;
  course: string;
  scholarshipType: string;
  message: string;
}

export default function ScholarshipPage() {
  usePageMeta({
    title: 'Scholarships & Fee Structure',
    description: 'Explore Global Minds Academy scholarships, fee structure, EMI options and discounts. Up to 50% off for merit, freshers, women in tech and early bird enrollments.',
  });

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ApplicationForm>({ name: '', email: '', phone: '', course: '', scholarshipType: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-surface-950 via-brand-950 to-surface-900 text-white py-20">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Scholarships & Fee Structure' }]} className="text-white/50 mb-4" />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-medium text-white/90 mb-6">
              <Percent className="w-4 h-4 text-yellow-400" />
              Up to 50% Scholarship Available
            </div>
            <h1 className="display-lg text-white mb-6">
              Scholarships &amp;<br />
              <span className="text-yellow-300">Fee Structure</span>
            </h1>
            <p className="text-white/70 text-xl mb-8 max-w-2xl">
              Quality tech education shouldn't break the bank. Explore our scholarships, flexible EMI plans and discounts designed to make learning accessible to everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#scholarships" className="btn-primary btn">View Scholarships</a>
              <a href="#fees" className="btn bg-white/10 border border-white/20 text-white hover:bg-white/20">See Fee Structure</a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="border-b border-surface-100 bg-white">
        <div className="container-xl py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: GraduationCap, label: 'Students Received Scholarship', value: '3,200+', color: 'text-brand-600' },
              { icon: Percent, label: 'Max Scholarship Available', value: '50%', color: 'text-green-600' },
              { icon: CreditCard, label: 'No-Cost EMI Up To', value: '12 Months', color: 'text-purple-600' },
              { icon: Users, label: 'Scholarship Types', value: '6 Types', color: 'text-orange-600' },
            ].map(s => (
              <div key={s.label}>
                <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                <div className="font-display font-bold text-2xl text-surface-900">{s.value}</div>
                <div className="text-sm text-surface-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scholarships */}
      <section id="scholarships" className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Financial Aid</span>
            <h2 className="display-md mb-4">Available Scholarships &amp; Discounts</h2>
            <p className="text-surface-500 max-w-2xl mx-auto">We offer multiple scholarship pathways to ensure no eligible student is held back by financial constraints.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map(s => (
              <div key={s.id} className={`rounded-2xl border-2 p-6 ${s.color} hover:shadow-card-md transition-shadow`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.badgeColor}`}>{s.badge}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-surface-900 mb-1">{s.title}</h3>
                <div className="text-2xl font-bold text-brand-700 mb-3">{s.discount}</div>
                <p className="text-sm text-surface-600 mb-4">{s.description}</p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2">Eligibility</p>
                  <ul className="space-y-1">
                    {s.eligibility.map(e => (
                      <li key={e} className="flex items-center gap-2 text-xs text-surface-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/70 rounded-xl p-3">
                  <p className="text-xs font-semibold text-surface-700 mb-1">How to Apply</p>
                  <p className="text-xs text-surface-600">{s.howToApply}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section id="fees" className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-10">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Pricing</span>
            <h2 className="display-md mb-4">Course Fee Structure</h2>
            <p className="text-surface-500 max-w-2xl mx-auto">Transparent pricing with no hidden charges. EMI options available on all courses.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-surface-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  <th className="text-left px-6 py-4 font-semibold text-surface-700">Course</th>
                  <th className="text-left px-4 py-4 font-semibold text-surface-700 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-4 font-semibold text-surface-700 hidden sm:table-cell">Duration</th>
                  <th className="text-right px-4 py-4 font-semibold text-surface-700">Fee</th>
                  <th className="text-right px-6 py-4 font-semibold text-surface-700 hidden lg:table-cell">EMI (6 mo.)</th>
                </tr>
              </thead>
              <tbody>
                {courseFees.map((c, i) => (
                  <tr key={c.course} className={`border-b border-surface-50 hover:bg-brand-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-surface-50/30'}`}>
                    <td className="px-6 py-4 font-medium text-surface-900">{c.course}</td>
                    <td className="px-4 py-4 text-surface-500 hidden md:table-cell">
                      <span className="bg-surface-100 px-2 py-0.5 rounded-full text-xs">{c.category}</span>
                    </td>
                    <td className="px-4 py-4 text-surface-500 hidden sm:table-cell">{c.duration}</td>
                    <td className="px-4 py-4 text-right font-bold text-surface-900">{c.fee}</td>
                    <td className="px-6 py-4 text-right text-brand-600 text-xs font-medium hidden lg:table-cell">{c.emi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-surface-400 mt-4 text-center">
            * Prices shown are base prices. Scholarships and discounts apply additionally. All prices include GST-applicable base. Contact us for exact pricing.
          </p>
        </div>
      </section>

      {/* EMI Plans */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Flexible Payments</span>
              <h2 className="display-sm mb-4">Easy EMI Plans</h2>
              <p className="text-surface-600 mb-6">
                Spread your course fee over 3, 6, or 12 months with no-cost EMI options via our banking and NBFC partners.
              </p>
              <div className="space-y-4 mb-8">
                {emiPlans.map(plan => (
                  <div key={plan.months} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-surface-100">
                    <CreditCard className="w-8 h-8 text-brand-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-surface-900">{plan.months}-Month EMI</div>
                      <div className="text-sm text-surface-500">{plan.note}</div>
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${plan.interest === '0%' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {plan.interest}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-700 mb-3">Accepted EMI Partners:</p>
                <div className="flex flex-wrap gap-2">
                  {emiPartners.map(p => (
                    <span key={p} className="bg-white border border-surface-200 rounded-lg px-3 py-1.5 text-xs text-surface-600">{p}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Scholarship Application */}
            <div id="apply" className="bg-white rounded-2xl border border-surface-100 p-8 shadow-card-sm">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-3">Application Submitted!</h3>
                  <p className="text-surface-600">Our team will review your application and contact you at <strong>{form.email}</strong> within 1 business day.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display font-bold text-xl mb-6">Apply for Scholarship</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-surface-700 mb-1">Full Name *</label>
                        <input name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-700 mb-1">Phone *</label>
                        <input name="phone" required value={form.phone} onChange={handleChange} placeholder="+91 99999 00000" className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-700 mb-1">Email *</label>
                      <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@email.com" className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-700 mb-1">Course Interested In *</label>
                      <select name="course" required value={form.course} onChange={handleChange} className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
                        <option value="">Select a course</option>
                        {courseFees.map(c => <option key={c.course}>{c.course}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-700 mb-1">Scholarship Type *</label>
                      <select name="scholarshipType" required value={form.scholarshipType} onChange={handleChange} className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
                        <option value="">Select scholarship</option>
                        {scholarships.map(s => <option key={s.id}>{s.title} ({s.discount})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-700 mb-1">Message (Optional)</label>
                      <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your background and why you're applying..." rows={3} className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" />
                    </div>
                    <Button type="submit" fullWidth>
                      Submit Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
