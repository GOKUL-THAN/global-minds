import { Link } from 'react-router-dom';
import {
  TrendingUp, Users, Building2, Star, Award, CheckCircle,
  Briefcase, ChevronRight,
} from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';

// ── Hiring Partners ────────────────────────────────────────
const hiringPartners = [
  { name: 'Amazon', logo: 'amazon.png', color: 'bg-orange-50' },
  { name: 'Microsoft', logo: 'microsoft.png', color: 'bg-blue-50' },
  { name: 'Google', logo: 'google.png', color: 'bg-green-50' },
  { name: 'Infosys', logo: 'infosys.png', color: 'bg-indigo-50' },
  { name: 'TCS', logo: 'tcs.png', color: 'bg-sky-50' },
  { name: 'Wipro', logo: 'wipro.png', color: 'bg-purple-50' },
  { name: 'HCL Technologies', logo: 'hcl.jpg', color: 'bg-blue-50' },
  { name: 'Cognizant', logo: 'cognizant.png', color: 'bg-cyan-50' },
  { name: 'Accenture', logo: 'accenture.png', color: 'bg-purple-50' },
  { name: 'IBM', logo: 'ibm.png', color: 'bg-blue-50' },
  { name: 'Capgemini', logo: 'capgemini.png', color: 'bg-indigo-50' },
  { name: 'Tech Mahindra', logo: 'techmahindra.png', color: 'bg-red-50' },
  { name: 'Deloitte', logo: 'deloitte.png', color: 'bg-green-50' },
  { name: 'Mphasis', logo: 'mphasis.png', color: 'bg-sky-50' },
  { name: 'L&T Technology Services', logo: 'ltts.svg', color: 'bg-emerald-50' },
  { name: 'LTIMindtree', logo: 'lti.svg', color: 'bg-green-50' },
  { name: 'Hexaware', logo: 'hexaware.png', color: 'bg-blue-50' },
  { name: 'Persistent', logo: 'persistent.svg', color: 'bg-violet-50' },
  { name: 'Zensar', logo: 'zensar.svg', color: 'bg-surface-900' },
  { name: 'Freshworks', logo: 'freshworks.png', color: 'bg-teal-50' },
  { name: 'Zoho', logo: 'zoho.png', color: 'bg-red-50' },
  { name: 'Razorpay', logo: 'razorpay.png', color: 'bg-blue-50' },
  { name: 'Swiggy', logo: 'swiggy.png', color: 'bg-orange-50' },
  { name: 'PhonePe', logo: 'phonepe.png', color: 'bg-purple-50' },
];

// ── Placement Stats ────────────────────────────────────────
const stats = [
  { value: '15,000+', label: 'Students Placed', icon: Users, color: 'text-brand-600', bg: 'bg-brand-50', href: '/career' },
  { value: '500+', label: 'Hiring Partners', icon: Building2, color: 'text-accent-600', bg: 'bg-accent-50', href: '/career/job-support' },
  { value: '4.8 LPA', label: 'Avg. Starting Package', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', href: '/career/job-support' },
  { value: '22 LPA', label: 'Highest Package', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/career/job-support' },
  { value: '95%', label: 'Placement Rate', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', href: '/career' },
  { value: '30 Days', label: 'Avg. Time to Offer', icon: CheckCircle, color: 'text-sky-600', bg: 'bg-sky-50', href: '/career/job-support' },
];

// ── Success Stories ────────────────────────────────────────
const successStories = [
  {
    name: 'Priya Sharma',
    course: 'Full Stack Development',
    company: 'Amazon',
    package: '18 LPA',
    avatar: 'PS',
    color: 'bg-brand-500',
    quote: 'The hands-on projects and mock interviews at Global Minds Academy gave me the confidence to crack Amazon\'s technical rounds. Best decision of my career!',
    prevRole: 'Fresher',
    location: 'Bangalore',
    href: '/courses/full-stack-development',
  },
  {
    name: 'Rahul Mehta',
    course: 'AWS & DevOps',
    company: 'Microsoft',
    package: '22 LPA',
    avatar: 'RM',
    color: 'bg-accent-500',
    quote: 'The AWS certification prep was incredible. I passed AWS Solutions Architect on first attempt and got a dream offer at Microsoft.',
    prevRole: 'Junior Developer',
    location: 'Hyderabad',
    href: '/courses/aws-devops',
  },
  {
    name: 'Anjali Nair',
    course: 'Data Science & AI',
    company: 'Google',
    package: '20 LPA',
    avatar: 'AN',
    color: 'bg-green-500',
    quote: 'Switching from a non-IT background felt impossible until Global Minds Academy\'s Data Science program. The mentors were patient and the curriculum was perfect.',
    prevRole: 'Marketing Analyst',
    location: 'Chennai',
    href: '/courses/data-science',
  },
  {
    name: 'Suresh Kumar',
    course: 'Software Testing',
    company: 'Infosys',
    package: '8 LPA',
    avatar: 'SK',
    color: 'bg-purple-500',
    quote: 'I had a gap of 2 years. The dedicated placement support team helped me rebuild my confidence and land a great job within 45 days of course completion.',
    prevRole: 'Career Gap',
    location: 'Mumbai',
    href: '/courses/software-testing',
  },
  {
    name: 'Kavitha Reddy',
    course: 'Python & Django',
    company: 'Zoho',
    package: '10 LPA',
    avatar: 'KR',
    color: 'bg-orange-500',
    quote: 'The project-based learning made my resume shine. Zoho was impressed with my GitHub portfolio built during training.',
    prevRole: 'BCA Graduate',
    location: 'Chennai',
    href: '/courses/python-full-stack',
  },
  {
    name: 'Arjun Singh',
    course: 'Cyber Security',
    company: 'IBM',
    package: '14 LPA',
    avatar: 'AS',
    color: 'bg-sky-500',
    quote: 'The CEH certification preparation combined with real-world labs helped me stand out. Got placed at IBM in just 3 weeks after completion.',
    prevRole: 'Network Admin',
    location: 'Pune',
    href: '/courses/cyber-security',
  },
];

// ── Placement Process ──────────────────────────────────────
const placementProcess = [
  {
    step: '01',
    title: 'Complete Your Training',
    desc: 'Finish the course with hands-on projects and a strong GitHub/portfolio.',
    icon: '🎓',
    href: '/courses',
  },
  {
    step: '02',
    title: 'Resume & Profile Prep',
    desc: 'Our career team helps craft an ATS-optimised resume and LinkedIn profile.',
    icon: '📄',
    href: '/career/resume-preparation',
  },
  {
    step: '03',
    title: 'Mock Interviews',
    desc: 'Technical and HR mock sessions with expert feedback and improvement guidance.',
    icon: '🎯',
    href: '/career/mock-interview',
  },
  {
    step: '04',
    title: 'Job Referrals',
    desc: 'Direct referrals to our 500+ hiring partner companies based on your skills.',
    icon: '🤝',
    href: '/career/job-support',
  },
  {
    step: '05',
    title: 'Interview Scheduling',
    desc: 'We coordinate with companies and schedule interviews on your behalf.',
    icon: '📅',
    href: '/career/job-support',
  },
  {
    step: '06',
    title: 'Offer & Onboarding',
    desc: 'Salary negotiation guidance and onboarding support until you join.',
    icon: '🏆',
    href: '/career/job-support',
  },
];

// ── Package Ranges ─────────────────────────────────────────
const packageRanges = [
  { range: '3 – 6 LPA', percentage: 35, label: 'Entry-level roles', color: 'bg-brand-400' },
  { range: '6 – 10 LPA', percentage: 40, label: 'Mid-level roles', color: 'bg-brand-500' },
  { range: '10 – 15 LPA', percentage: 18, label: 'Senior roles', color: 'bg-brand-600' },
  { range: '15 LPA+', percentage: 7, label: 'Lead / Specialist roles', color: 'bg-brand-700' },
];

export default function PlacementPage() {
  usePageMeta({
    title: 'Placement Records & Hiring Partners',
    description: 'Global Minds Academy placement records — 15,000+ students placed in top companies like Amazon, Google, Microsoft. 95% placement rate with dedicated career support.',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-surface-950 via-brand-950 to-surface-900 text-white py-20">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Placement Records' }]} className="text-white/50 mb-4" />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white/90 mb-6">
              <TrendingUp className="w-4 h-4 text-green-400" />
              95% Placement Rate — 2024 Batch
            </div>
            <h1 className="display-lg text-white mb-6">
              Placement Records &amp;<br />
              <span className="text-gradient-light">Hiring Partners</span>
            </h1>
            <p className="text-white/70 text-xl mb-8 max-w-2xl">
              Over 15,000 students placed in top MNCs and product companies. Our dedicated placement team works with 500+ hiring partners to get you the best opportunities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary btn">
                Start Your Journey
              </Link>
              <Link to="/courses" className="btn bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(s => (
              <Link key={s.label} to={s.href} className="block text-center p-5 rounded-2xl border border-surface-100 hover:shadow-card-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={`Learn about ${s.label} and career support`}>
                <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="font-display font-bold text-2xl text-surface-900 mb-1">{s.value}</div>
                <div className="text-sm text-surface-500">{s.label}</div>
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Partners */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Our Network</span>
            <h2 className="display-md mb-4">500+ Hiring Partners</h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              We have tie-ups with leading MNCs, product companies and startups across India and globally who actively hire from our placement pool.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {hiringPartners.map(p => (
              <Link
                key={p.name}
                to="/career/job-support"
                aria-label={`Learn about placement support for ${p.name}`}
                className={`${p.color} rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
              >
                <img
                  src={`/images/hiring-partners/${p.logo}`}
                  alt={`${p.name} logo`}
                  className="h-10 max-w-full object-contain"
                  loading="lazy"
                />
                <span className={`text-xs font-medium text-center leading-tight ${p.color === 'bg-surface-900' ? 'text-white' : 'text-surface-700'}`}>{p.name}</span>
              </Link>
            ))}
            <Link to="/career/job-support" aria-label="Learn about placement support with more companies" className="bg-brand-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span className="text-2xl font-bold text-brand-600">500+</span>
              <span className="text-xs font-medium text-surface-700 text-center">More companies</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Package Distribution */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Salary Insights</span>
              <h2 className="display-md mb-4">Package Distribution</h2>
              <p className="text-surface-500 mb-8">
                Our students secure competitive packages across roles and experience levels. Packages vary by skill, role and company.
              </p>
              <div className="space-y-5">
                {packageRanges.map(p => (
                  <div key={p.range}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-surface-900">{p.range}</span>
                        <span className="text-sm text-surface-500 ml-2">— {p.label}</span>
                      </div>
                      <span className="font-bold text-surface-900">{p.percentage}%</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-3">
                      <div
                        className={`${p.color} h-3 rounded-full transition-all duration-1000`}
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-3xl p-8">
              <h3 className="font-display font-bold text-xl mb-6 text-surface-900">Placement Highlights</h3>
              <div className="space-y-4">
                {[
                  { label: 'Highest Package Secured', value: '22 LPA', icon: '🏆' },
                  { label: 'Average Package', value: '8.5 LPA', icon: '📊' },
                  { label: 'Companies Visited in 2024', value: '120+', icon: '🏢' },
                  { label: 'Off-Campus Drives Conducted', value: '45+', icon: '🚀' },
                  { label: 'Students in Product Companies', value: '2,800+', icon: '⚡' },
                  { label: 'International Placements', value: '340+', icon: '🌍' },
                ].map(h => (
                  <div key={h.label} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{h.icon}</span>
                      <span className="text-sm text-surface-700">{h.label}</span>
                    </div>
                    <span className="font-bold text-brand-700">{h.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Process */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">How It Works</span>
            <h2 className="display-md mb-4">Our Placement Process</h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              A structured, step-by-step approach to ensure you are interview-ready and land the right role.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placementProcess.map((step, idx) => (
              <Link key={step.step} to={step.href} className="block bg-white rounded-2xl p-6 border border-surface-100 hover:shadow-card-md hover:-translate-y-0.5 transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={`Learn more: ${step.title}`}>
                <div className="absolute top-4 right-4 text-4xl font-display font-black text-surface-100">{step.step}</div>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="font-display font-bold text-lg text-surface-900 mb-2">{step.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{step.desc}</p>
                {idx < placementProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ChevronRight className="w-6 h-6 text-brand-300" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Alumni Stories</span>
            <h2 className="display-md mb-4">Student Success Stories</h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              Real students. Real companies. Real results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {successStories.map(s => (
              <Link key={s.name} to={s.href} className="block bg-white rounded-2xl border border-surface-100 p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={`Explore ${s.course} training`}>
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900">{s.name}</h3>
                    <p className="text-sm text-surface-500">{s.course}</p>
                    <p className="text-xs text-surface-400">{s.prevRole} → {s.company}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-green-600">{s.package}</div>
                    <div className="text-xs text-surface-400">{s.location}</div>
                  </div>
                </div>
                <p className="text-sm text-surface-600 leading-relaxed italic">"{s.quote}"</p>
                <div className="mt-4 pt-4 border-t border-surface-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-medium text-brand-700">{s.company}</span>
                  <span className="ml-auto text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">{s.package}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Roles We Place In */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Career Paths</span>
            <h2 className="display-md mb-4">Roles We Place Students In</h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              'Software Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Architect',
              'Data Scientist', 'ML Engineer', 'QA Automation Engineer', 'Cyber Security Analyst',
              'Site Reliability Engineer', 'Data Analyst', 'Business Analyst', 'UI/UX Designer',
              'Database Administrator', 'Network Engineer', 'Python Developer', 'Java Developer',
              'React Developer', 'Node.js Developer', 'AWS Solutions Architect', 'Azure Engineer',
              'Salesforce Developer', 'RPA Developer', 'ETL Developer', 'BI Developer',
            ].map(role => (
              <span
                key={role}
                className="px-4 py-2 bg-white border border-surface-200 rounded-full text-sm text-surface-700 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-default"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="container-xl py-4">
        <p className="text-xs text-surface-400 text-center">
          * Placement figures are indicative based on past batch performance. Outcomes depend on individual skills, effort, and market conditions. No guarantee of placement is implied or offered.
        </p>
      </div>

      <CTASection />
    </div>
  );
}
