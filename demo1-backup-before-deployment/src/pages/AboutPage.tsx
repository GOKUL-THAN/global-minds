import { Briefcase, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';

const coreStats = [
  { icon: Briefcase, label: 'Hiring Partners', value: '50+', color: 'bg-accent-50 text-accent-600' },
];

const features = [
  {
    icon: Zap,
    title: 'Agile Learning',
    description: 'Sprint-based real project sprints',
    cardClass: 'border-amber-200 bg-white shadow-[0_6px_18px_rgba(217,119,6,0.08)]',
    iconClass: 'bg-gradient-to-br from-amber-500 to-yellow-500',
  },
  {
    icon: ShieldCheck,
    title: 'Direct Hires',
    description: '50+ Hiring partners across top tech companies',
    cardClass: 'border-teal-200 bg-white shadow-[0_6px_18px_rgba(13,148,136,0.08)]',
    iconClass: 'bg-gradient-to-br from-teal-600 to-teal-500',
  },
];

export default function AboutPage() {
  usePageMeta({
    title: 'About Us',
    description: 'At Global Minds Academy, we offer specialized training programs designed to meet industry standards and future career demands. 100% placement opportunity.',
  });

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-surface-950 via-brand-950 to-surface-900 text-white py-20">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'About Us' }]} className="text-white/50 mb-4" />
          <div className="max-w-4xl">
            <h1 className="display-lg text-white mb-6">
              Building Skills today for <span className="text-gradient">Tomorrow&apos;s Leaders</span>
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-white/70">
              At Global Minds Academy, we offer specialized training programs designed to meet industry standards and future career demands. Our courses include advanced IT technologies such as Python, Java, React JS, Node.js, AWS, Data Science, Data Warehousing, Blockchain, Dot Net, Selenium, Hadoop, Tableau, Power BI, and more.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/60">
              All programs are industry-oriented, certification-backed, and come with 100% placement opportunity.
            </p>
          </div>
        </div>
      </div>

      {/* ── Core Stats ─────────────────────────────────── */}
      <div className="border-b border-surface-100">
        <div className="container-xl py-10">
          <div className="mx-auto grid max-w-xs grid-cols-1 gap-6 text-center">
            {coreStats.map(s => (
              <div key={s.label} className={`p-6 rounded-2xl ${s.color}`}>
                <s.icon className="w-7 h-7 mx-auto mb-2" />
                <div className="text-3xl font-black">{s.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-600">Why Global Minds</p>
              <h2 className="display-md mb-4">Designed for real-world growth</h2>
              <p className="text-lg leading-relaxed text-surface-600">
                We help learners build job-ready skills through practical, industry-led training and mentor support.
              </p>
            </div>
            <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-[0_20px_40px_-10px_rgba(13,148,136,0.12)]">
              <img src="/logo.png" alt="Global Minds Academy emblem" className="mx-auto mb-6 h-28 w-28 object-contain" />
              <h3 className="text-center text-2xl font-black tracking-[0.12em] text-surface-900">GLOBAL MINDS ACADEMY</h3>
              <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                Build Skills | Own the Future
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.map(feature => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className={`rounded-2xl border p-6 ${feature.cardClass}`}>
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white ${feature.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-extrabold text-surface-900">{feature.title}</div>
                  <div className="mt-2 text-sm font-medium text-surface-500">{feature.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ── Values ─────────────────────────────────────── */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <h2 className="display-md text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Practical Learning', desc: 'Every session is hands-on — real tools, real projects, real-world scenarios from day one.' },
              { title: 'Industry Excellence', desc: 'Curriculum built and reviewed by working professionals from top tech companies.' },
              { title: 'Career First', desc: 'Placement support, resume prep and mock interviews are built into every program.' },
              { title: 'Continuous Growth', desc: 'Learning doesn\'t stop at graduation — alumni get lifetime access to updated course content.' },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-surface-100 text-center hover:shadow-card-md transition-shadow">
                <CheckCircle className="w-8 h-8 text-brand-500 mx-auto mb-3" />
                <h3 className="font-semibold text-surface-900 mb-2">{v.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Join Global Minds Academy"
        subtitle="AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing."
        primaryLabel="Book Free Demo Class"
        primaryHref="/demo-class"
        secondaryLabel="View All Courses"
        secondaryHref="/courses"
      />
    </div>
  );
}
