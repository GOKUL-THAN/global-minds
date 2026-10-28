import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';
import { ShinyText } from '../components/ui/ShinyText';
import { DecryptedText } from '../components/ui/DecryptedText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { CountUp } from '../components/ui/CountUp';

const placementStats = [
  { icon: Users, value: '1,000+', label: 'Students Placed', tone: 'teal' },
  { icon: Building2, value: '50+', label: 'Hiring Partners', tone: 'amber' },
  { icon: TrendingUp, value: '4.8 LPA', label: 'Avg. Starting Package', tone: 'green' },
  { icon: Star, value: '22 LPA', label: 'Highest Package', tone: 'gold' },
  { icon: Award, value: '80%', label: 'Placement Rate', tone: 'purple' },
  { icon: CheckCircle2, value: '30 Days', label: 'Avg. Time to Offer', tone: 'blue' },
];

const partners = [
  { name: 'Infosys', mark: 'Inf', logo: '/images/hiring-partners/infosys.png', tone: 'indigo' },
  { name: 'TCS', mark: 'tcs', logo: '/images/hiring-partners/tcs.png', tone: 'sky' },
  { name: 'Wipro', mark: 'w', logo: '/images/hiring-partners/wipro.png', tone: 'violet' },
  { name: 'HCL Technologies', mark: 'HCL', logo: '/images/hiring-partners/hcl.jpg', tone: 'indigo' },
  { name: 'Cognizant', mark: 'C', logo: '/images/hiring-partners/cognizant.png', tone: 'cyan' },
  { name: 'Accenture', mark: '>', logo: '/images/hiring-partners/accenture.png', tone: 'violet' },
  { name: 'IBM', mark: 'IBM', logo: '/images/hiring-partners/ibm.png', tone: 'slate' },
  { name: 'Capgemini', mark: 'C', logo: '/images/hiring-partners/capgemini.png', tone: 'blue' },
  { name: 'Tech Mahindra', mark: 'TM', logo: '/images/hiring-partners/techmahindra.png', tone: 'rose' },
  { name: 'Deloitte', mark: 'D.', logo: '/images/hiring-partners/deloitte.png', tone: 'green' },
  { name: 'Mphasis', mark: 'M', logo: '/images/hiring-partners/mphasis.png', tone: 'sky' },
  { name: 'L&T Technology Services', mark: 'L&T', logo: '/images/hiring-partners/ltts.svg', tone: 'mint' },
  { name: 'LTIMindtree', mark: 'LTIM', logo: '/images/hiring-partners/lti.svg', tone: 'green' },
  { name: 'Hexaware', mark: 'H', logo: '/images/hiring-partners/hexaware.png', tone: 'blue' },
  { name: 'Persistent', mark: '∞', logo: '/images/hiring-partners/persistent.svg', tone: 'violet' },
  { name: 'Coforge', mark: 'C', tone: 'teal' },
  { name: 'Birlasoft', mark: 'B', tone: 'amber' },
  { name: 'Mastek', mark: 'M', tone: 'purple' },
  { name: 'Sonata Software', mark: 'S', tone: 'blue' },
  { name: 'KPIT Technologies', mark: 'KPIT', tone: 'green' },
  { name: 'UST', mark: 'UST', tone: 'orange' },
  { name: 'Virtusa', mark: 'V', tone: 'sky' },
  { name: 'Zensar', mark: 'zensar', logo: '/images/hiring-partners/zensar.svg', tone: 'slate' },
  { name: 'Freshworks', mark: 'F', logo: '/images/hiring-partners/freshworks.png', tone: 'mint' },
  { name: 'Zoho', mark: 'Z', logo: '/images/hiring-partners/zoho.png', tone: 'rose' },
  { name: 'Razorpay', mark: 'R', logo: '/images/hiring-partners/razorpay.png', tone: 'blue' },
  { name: 'Swiggy', mark: 'S', logo: '/images/hiring-partners/swiggy.png', tone: 'orange' },
  { name: 'PhonePe', mark: 'पे', logo: '/images/hiring-partners/phonepe.png', tone: 'violet' },
];

const packageRanges = [
  { range: '3 – 6 LPA', level: 'Entry-level roles', share: 35 },
  { range: '6 – 10 LPA', level: 'Mid-level roles', share: 40 },
  { range: '10 – 15 LPA', level: 'Senior roles', share: 18 },
  { range: '15 LPA+', level: 'Lead / Specialist roles', share: 7 },
];

const placementHighlights = [
  { icon: '🏆', label: 'Highest Package Secured', value: '22 LPA' },
  { icon: '📊', label: 'Average Package', value: '8.5 LPA' },
  { icon: '🏢', label: 'Companies Visited in 2025', value: '120+' },
  { icon: '🚀', label: 'Off-Campus Drives Conducted', value: '45+' },
  { icon: '⚡', label: 'Students in Product Companies', value: '150+' },
  { icon: '🌍', label: 'International Placements', value: '25+' },
];

const placementSteps = [
  { icon: '🎓', title: 'Complete Your Training', description: 'Finish the course with hands-on projects and a strong GitHub portfolio.' },
  { icon: '📄', title: 'Resume & Profile Prep', description: 'Our career team helps craft an ATS-optimised resume and LinkedIn profile.' },
  { icon: '🎯', title: 'Mock Interviews', description: 'Technical and HR mock sessions with expert feedback and improvement guidance.' },
  { icon: '🤝', title: 'Job Referrals', description: 'Direct referrals to our 50+ hiring partner companies based on your skills.' },
  { icon: '🗓️', title: 'Interview Scheduling', description: 'We coordinate with companies and schedule interviews on your behalf.' },
  { icon: '🏆', title: 'Offer & Onboarding', description: 'Salary negotiation guidance and onboarding support until you join.' },
];

const studentStories = [
  {
    initials: 'SK',
    name: 'Suresh Kumar',
    course: 'Software Testing',
    details: 'Career Gap → Infosys',
    location: 'Mumbai',
    package: '8 LPA',
    company: 'Infosys',
    logo: '/images/hiring-partners/infosys.png',
    quote: 'I had a gap of 2 years. The dedicated placement support team helped me rebuild my confidence and land a great job within 45 days of course completion.',
    tone: 'purple',
  },
  {
    initials: 'KR',
    name: 'Kavitha Reddy',
    course: 'Python & Django',
    details: 'BCA Graduate → Zoho',
    location: 'Chennai',
    package: '10 LPA',
    company: 'Zoho',
    logo: '/images/hiring-partners/zoho.png',
    quote: 'The project-based learning made my resume shine. Zoho was impressed with my GitHub portfolio built during training.',
    tone: 'orange',
  },
  {
    initials: 'AS',
    name: 'Arjun Singh',
    course: 'Cyber Security',
    details: 'Network Admin → IBM',
    location: 'Pune',
    package: '14 LPA',
    company: 'IBM',
    logo: '/images/hiring-partners/ibm.png',
    quote: 'The CEH certification preparation combined with real-world labs helped me stand out. Got placed at IBM in just 3 weeks after course completion.',
    tone: 'blue',
  },
];

const careerPaths = [
  'Software Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Architect',
  'Data Scientist', 'ML Engineer', 'QA Automation Engineer', 'Cyber Security Analyst',
  'Site Reliability Engineer', 'Data Analyst', 'Business Analyst', 'UI/UX Designer',
  'Database Administrator', 'Network Engineer', 'Python Developer', 'Java Developer',
  'React Developer', 'Node.js Developer', 'AWS Solutions Architect', 'Azure Engineer',
  'Salesforce Developer', 'RPA Developer', 'ETL Developer', 'BI Developer',
];

const toneStyles: Record<string, { icon: string; card: string }> = {
  teal: { icon: 'bg-teal-50 text-teal-700', card: 'bg-teal-600' },
  amber: { icon: 'bg-amber-50 text-amber-600', card: 'bg-amber-500' },
  green: { icon: 'bg-green-50 text-green-600', card: 'bg-green-500' },
  gold: { icon: 'bg-yellow-50 text-yellow-600', card: 'bg-yellow-500' },
  purple: { icon: 'bg-purple-50 text-purple-600', card: 'bg-purple-500' },
  blue: { icon: 'bg-sky-50 text-sky-600', card: 'bg-sky-500' },
  orange: { icon: 'bg-orange-50 text-orange-600', card: 'bg-orange-500' },
};

export default function PlacementPage() {
  usePageMeta({
    title: 'Placement Records & Hiring Partners',
    description: 'Explore Global Minds Academy placement records, hiring partners, student success stories and career support.',
  });

  return (
    <div className="min-h-screen bg-white">
      <section className="page-hero-premium py-16 sm:py-20 lg:py-24">
        <div className="container-xl relative z-10">
          <div className="max-w-3xl">
            <Breadcrumbs items={[{ label: 'Placement Records' }]} className="mb-5" />
            <div className="page-hero-badge mb-6">
              <TrendingUp className="h-4 w-4 text-teal-600" aria-hidden="true" />
              <ShinyText text="80% Placement Rate — 2024 Batch" shinyColor="rgba(23, 108, 115, 0.9)" />
            </div>
            <h1 className="mb-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-surface-900">
              Placement Records &amp; <DecryptedText text="Hiring Partners" speed={30} maxIterations={10} className="page-hero-highlight" />
            </h1>
            <p className="page-hero-desc max-w-2xl text-lg sm:text-xl leading-relaxed">
              Over 1,000 students placed in top MNCs and product companies. Our dedicated placement team works with 50+ hiring partners to get you the best opportunities.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 font-bold text-white transition-colors hover:bg-teal-800 shadow-md shadow-teal-900/15"
              >
                Start Your Journey <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-xl border border-teal-600/30 bg-white px-6 py-3.5 font-bold text-teal-800 transition-colors hover:bg-teal-50 shadow-sm"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-100 bg-white py-10 sm:py-14" aria-label="Placement statistics">
        <div className="container-xl grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {placementStats.map(({ icon: Icon, value, label, tone }) => (
            <SpotlightCard key={label}>
              <div className="rounded-2xl border border-surface-100 bg-white px-3 py-5 text-center shadow-sm sm:px-4 h-full flex flex-col justify-between">
                <div>
                  <span className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${toneStyles[tone].icon}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="text-2xl font-extrabold tracking-tight text-surface-950 sm:text-3xl">
                    {value === '1,000+' ? <CountUp end={1000} suffix="+" start />
                      : value === '50+' ? <CountUp end={50} suffix="+" start />
                      : value === '80%' ? <CountUp end={80} suffix="%" start />
                      : value}
                  </p>
                </div>
                <p className="mt-1 text-sm text-surface-500 font-medium">{label}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-700">Our Network</p>
            <h2 className="display-md mb-4">50+ Hiring Partners</h2>
            <p className="text-lg leading-relaxed text-surface-500">
              We have tie-ups with leading MNCs, product companies and startups across India and globally who actively hire from our placement pool.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {partners.map(partner => (
              <div
                key={partner.name}
                className={`flex min-h-28 flex-col items-center justify-center rounded-2xl px-3 py-4 text-center transition-transform hover:-translate-y-1 ${toneStyles[partner.tone]?.icon ?? 'bg-brand-50 text-brand-700'}`}
              >
                <span className="mb-2 flex h-11 w-14 items-center justify-center rounded-xl bg-white/80 p-1.5">
                  {partner.logo ? (
                    <>
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="max-h-full max-w-full object-contain"
                        onError={event => {
                          event.currentTarget.hidden = true;
                          event.currentTarget.nextElementSibling?.removeAttribute('hidden');
                        }}
                      />
                      <span hidden className="text-lg font-extrabold tracking-tight">{partner.mark}</span>
                    </>
                  ) : (
                    <span className="text-lg font-extrabold tracking-tight">{partner.mark}</span>
                  )}
                </span>
                <span className="text-xs font-medium text-surface-800">{partner.name}</span>
              </div>
            ))}
            <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl bg-teal-50 px-3 py-4 text-center text-teal-800">
              <span className="text-2xl font-extrabold">50+</span>
              <span className="mt-1 text-xs font-medium">More companies</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-xl grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-700">Salary Insights</p>
            <h2 className="display-md mb-4">Package Distribution</h2>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-surface-500">
              Our students secure competitive packages across roles and experience levels. Packages vary by skill, role and company.
            </p>
            <div className="space-y-6">
              {packageRanges.map(item => (
                <div key={item.range}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="text-sm text-surface-500 sm:text-base">
                      <span className="font-bold text-surface-900">{item.range}</span>
                      <span className="mx-2">—</span>{item.level}
                    </p>
                    <span className="font-bold text-surface-900">{item.share}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-surface-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-700" style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-surface-400">
              Package figures are indicative and may vary based on role, experience, skills and employer.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-teal-50 to-amber-50 p-5 sm:p-8">
            <h3 className="mb-5 text-xl font-bold text-surface-950">Placement Highlights</h3>
            <div className="space-y-3">
              {placementHighlights.map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <span className="min-w-0 flex-1 text-sm text-surface-700 sm:text-base">{item.label}</span>
                  <span className="whitespace-nowrap font-bold text-teal-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-700">How It Works</p>
            <h2 className="display-md mb-4">Our Placement Process</h2>
            <p className="text-lg leading-relaxed text-surface-500">
              A structured, step-by-step approach to ensure you are interview-ready and land the right role.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {placementSteps.map((step, index) => (
              <article key={step.title} className="relative rounded-2xl border border-surface-100 bg-white p-6 sm:p-7">
                <span className="absolute right-5 top-3 text-4xl font-extrabold text-surface-100 sm:text-5xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="mb-5 block text-3xl" aria-hidden="true">{step.icon}</span>
                <h3 className="mb-2 text-lg font-bold text-surface-950">{step.title}</h3>
                <p className="max-w-sm leading-relaxed text-surface-500">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-700">Alumni Stories</p>
            <h2 className="display-md mb-4">Student Success Stories</h2>
            <p className="text-lg text-surface-500">Real students. Real companies. Real results.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {studentStories.map(story => (
              <article key={story.name} className="flex h-full flex-col rounded-2xl border border-surface-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-surface-100 p-1.5">
                    <img src={story.logo} alt={`${story.company} logo`} className="max-h-full max-w-full object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-surface-950">{story.name}</h3>
                    <p className="text-sm text-surface-500">{story.course}</p>
                    <p className="text-xs text-surface-400">{story.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{story.package}</p>
                    <p className="text-xs text-surface-400">{story.location}</p>
                  </div>
                </div>
                <p className="mb-5 flex-1 text-sm italic leading-relaxed text-surface-600">“{story.quote}”</p>
                <div className="flex items-center justify-between border-t border-surface-100 pt-4">
                  <span className="inline-flex items-center gap-2 font-medium text-teal-800">
                    <Briefcase className="h-4 w-4" aria-hidden="true" />{story.company}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{story.package}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-700">Career Paths</p>
            <h2 className="display-md">Roles We Place Students In</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {careerPaths.map(path => (
              <span key={path} className="rounded-full border border-surface-200 bg-white px-5 py-3 text-sm font-medium text-surface-700 shadow-sm">
                {path}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Launch Your Career?"
        subtitle="Build in-demand skills, create a portfolio and get guidance from our placement support team."
        primaryLabel="Explore Courses"
        primaryHref="/courses"
        secondaryLabel="Start Your Journey"
        secondaryHref="/contact"
        variant="dark"
      />
    </div>
  );
}
