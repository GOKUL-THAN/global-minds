import { Users, Award, Globe, Target, CheckCircle, MapPin, Phone, Mail, ArrowRight, Code2, Cpu, Briefcase, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { instructors } from '../data/instructors';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCmsCollection } from '../hooks/useCmsCollection';

const coreStats = [
  { icon: Users,    label: 'Graduates Trained', value: '15,000+',  color: 'bg-brand-50 text-brand-600' },
  { icon: Award,    label: 'Placement Success',  value: '98.4%',    color: 'bg-green-50 text-green-600' },
  { icon: Globe,    label: 'Countries',          value: '25+',      color: 'bg-purple-50 text-purple-600' },
  { icon: Target,   label: 'Hiring Partners',    value: '350+',     color: 'bg-accent-50 text-accent-600' },
];

const standards = [
  {
    icon: Code2,
    title: 'Curriculum by Industry Leads',
    description: 'Designed directly by engineers from Google, Amazon and top tech companies using Java 21, Spring Boot, React 18, PyTorch and the latest cloud architectures.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: Cpu,
    title: 'Enterprise Capstone Projects',
    description: 'Every program includes real enterprise capstone projects — Smart EMS, AI Healthcare Assistant, Cloud E-Commerce — that become your portfolio on GitHub.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Briefcase,
    title: 'Agile Sprint-Based Learning',
    description: 'Training is structured in sprint cycles mirroring real-world Agile workflows, so you arrive at your first job already comfortable with professional development rhythms.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Award,
    title: 'Industry-Accredited Certification',
    description: 'All programs come with 100% placement opportunity backed by our 350+ hiring partner network spanning India, US, Europe and Asia Pacific.',
    color: 'bg-accent-50 text-accent-600',
  },
];

const locations = [
  {
    city: 'Chennai – Perumbakkam',
    address: 'Global Minds Academy, Perumbakkam, Chennai – 600 100, Tamil Nadu, India',
    phone: '+91 99999 00000',
    email: 'perumbakkam@globalmindsacademy.in',
  },
];

const hiringPartners = [
  'Amazon', 'Microsoft', 'Google', 'Infosys', 'TCS', 'Wipro',
  'HCL Technologies', 'Cognizant', 'Accenture', 'IBM',
  'Capgemini', 'Tech Mahindra', 'Zoho', 'Freshworks', 'Razorpay',
];

export default function AboutPage() {
  const visibleInstructors = useCmsCollection('instructors', instructors);
  const [expandedTrainer, setExpandedTrainer] = useState<string | null>(null);

  usePageMeta({
    title: 'About Us',
    description: 'Global Minds Academy — 15,000+ graduates trained, 98.4% placement success, 350+ hiring partners. Industry-accredited full-stack, AI/ML and cloud bootcamps in Chennai.',
  });

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-surface-950 via-brand-950 to-surface-900 text-white py-20">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'About Us' }]} className="text-white/50 mb-4" />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-medium text-white/90 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Recognised Tech Academy &amp; Solutions Provider
            </div>
            <h1 className="display-lg text-white mb-6">About Global Minds Academy</h1>
            <p className="text-white/70 text-xl leading-relaxed mb-4">
              Building Skills Today for Tomorrow's Leaders.
            </p>
            <p className="text-white/60 text-base leading-relaxed">
              Global Minds Academy offers specialised training programs designed to meet industry standards and future career demands — covering advanced IT technologies including Python, Java, React JS, Node.js, AWS, Data Science, Data Warehousing, Blockchain, .NET, Selenium, Hadoop, Tableau, Power BI, and more.
            </p>
            <p className="text-white/50 text-sm mt-3">
              All programs are industry-oriented, certification-backed, and come with 100% placement opportunity.
            </p>
          </div>
        </div>
      </div>

      {/* ── Core Stats ─────────────────────────────────── */}
      <div className="border-b border-surface-100">
        <div className="container-xl py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

      {/* ── Mission & Vision ───────────────────────────── */}
      <section className="section">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              {/* Mission */}
              <div>
                <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Our Mission</span>
                <h2 className="display-sm mb-3">Bridge the Gap Between Education and Industry</h2>
                <p className="text-surface-500 leading-relaxed">
                  To bridge the gap between academic education and modern industry demands through immersive hands-on training and real-world project development — empowering every learner with the practical skills, industry credentials and career support needed to thrive in the global tech economy.
                </p>
              </div>

              {/* Vision */}
              <div>
                <span className="inline-block text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Our Vision</span>
                <h2 className="display-sm mb-3">Empower 1,00,000 Global Tech Leaders</h2>
                <p className="text-surface-500 leading-relaxed">
                  To empower 1,00,000 global tech leaders by providing world-class education, state-of-the-art tools, and career placement mentorship — transforming learners from across India, the US, Europe and Asia Pacific into future-ready professionals.
                </p>
              </div>
            </div>

            {/* Our Standards */}
            <div>
              <span className="inline-block text-xs font-semibold text-green-600 uppercase tracking-wider mb-4">Our Standards</span>
              <div className="space-y-4">
                {standards.map(s => (
                  <div key={s.title} className="flex gap-4 p-5 rounded-2xl border border-surface-100 hover:shadow-card-sm transition-shadow">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 mb-1">{s.title}</h3>
                      <p className="text-surface-500 text-sm leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Offer ──────────────────────────────── */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">What We Offer</span>
            <h2 className="display-md mb-4">Career-Driven Bootcamps</h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              Every program is sprint-based, practical and directly aligned to what top tech companies hire for.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { track: 'Full Stack Java Spring Boot & React', icon: '☕', tags: ['Java 21', 'Spring Boot', 'React', 'MySQL'] },
              { track: 'AI & Machine Learning Masterclass', icon: '🧠', tags: ['Python', 'PyTorch', 'TensorFlow', 'HuggingFace'] },
              { track: 'AWS Cloud Architect', icon: '☁️', tags: ['EC2', 'RDS', 'S3', 'Lambda', 'Terraform'] },
              { track: 'Data Science & Data Warehousing', icon: '📊', tags: ['Python', 'Tableau', 'Power BI', 'Hadoop'] },
              { track: 'DevOps Engineering', icon: '🔧', tags: ['Docker', 'Kubernetes', 'Jenkins', 'Ansible'] },
              { track: '.NET / C# Development', icon: '🔷', tags: ['C#', '.NET Core', 'ASP.NET', 'Azure'] },
              { track: 'Python Full Stack', icon: '🐍', tags: ['Python', 'Django', 'React', 'PostgreSQL'] },
              { track: 'Blockchain Development', icon: '⛓️', tags: ['Solidity', 'Ethereum', 'Web3', 'Hardhat'] },
              { track: 'Selenium & Test Automation', icon: '🧪', tags: ['Selenium', 'TestNG', 'Cucumber', 'Jenkins'] },
            ].map(item => (
              <div key={item.track} className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-card-md transition-shadow">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-surface-900 mb-2 text-sm">{item.track}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map(t => (
                    <span key={t} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/courses">
              <button className="btn-primary btn text-sm flex items-center gap-2 mx-auto">
                View All 175+ Courses <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Hiring Partners ────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-10">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Hiring Network</span>
            <h2 className="display-sm mb-3">350+ Hiring Partners</h2>
            <p className="text-surface-500">Our graduates are placed at top MNCs and product companies globally.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {hiringPartners.map(p => (
              <span key={p} className="px-4 py-2 bg-surface-50 border border-surface-200 rounded-full text-sm text-surface-700 font-medium hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                {p}
              </span>
            ))}
            <span className="px-4 py-2 bg-brand-50 border border-brand-200 rounded-full text-sm text-brand-700 font-bold">
              300+ more companies
            </span>
          </div>
        </div>
      </section>

      {/* ── Expert Trainers ────────────────────────────── */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Expert Faculty</span>
            <h2 className="display-md mb-4">Meet Our Senior Trainers</h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Senior software architects, AI researchers and cloud engineers with real enterprise experience — the same professionals who design curricula for top companies.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleInstructors.map(trainer => (
              <div key={trainer.id} className="bg-white rounded-2xl p-6 border border-surface-100 hover:shadow-card-md transition-shadow text-center">
                <img src={trainer.photo} alt={trainer.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4" loading="lazy" />
                <h3 className="font-semibold text-surface-900 mb-1">{trainer.name}</h3>
                <p className="text-brand-600 text-sm mb-1">{trainer.designation}</p>
                <p className="text-surface-400 text-xs mb-3">{trainer.experience} experience</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {trainer.expertise.slice(0, 3).map(e => (
                    <span key={e} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-lg">{e}</span>
                  ))}
                </div>
                <button
                  type="button"
                  aria-expanded={expandedTrainer === trainer.id}
                  aria-controls={`about-trainer-${trainer.id}`}
                  onClick={() => setExpandedTrainer(current => current === trainer.id ? null : trainer.id)}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                >
                  {expandedTrainer === trainer.id ? 'Show less' : 'More trainer details'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedTrainer === trainer.id ? 'rotate-180' : ''}`} />
                </button>
                <div id={`about-trainer-${trainer.id}`} hidden={expandedTrainer !== trainer.id} className="mt-4 border-t border-surface-100 pt-4 text-left">
                  <p className="text-sm text-surface-500 mb-3">{trainer.bio}</p>
                  <p className="text-xs font-semibold uppercase text-surface-400 mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {trainer.expertise.map(expertise => (
                      <span key={expertise} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-lg">{expertise}</span>
                    ))}
                  </div>
                  <p className="text-xs font-semibold uppercase text-surface-400 mb-2">Certifications</p>
                  <ul className="space-y-1">
                    {trainer.certifications.map(cert => (
                      <li key={cert} className="text-xs text-surface-600">{cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/trainers">
              <button className="btn-secondary btn text-sm mx-auto">View All Trainers →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Location ───────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-10">
            <span className="inline-block text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Find Us</span>
            <h2 className="display-sm mb-3">Our Training Centre</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            {locations.map(loc => (
              <div key={loc.city} className="bg-surface-50 rounded-2xl p-8 border border-surface-100">
                <h3 className="font-display font-bold text-xl text-surface-900 mb-4">{loc.city}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-surface-600">
                    <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    {loc.address}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-surface-600">
                    <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <a href={`tel:${loc.phone}`} className="hover:text-brand-600">{loc.phone}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-surface-600">
                    <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <a href={`mailto:${loc.email}`} className="hover:text-brand-600">{loc.email}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <h2 className="display-md text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Practical First', desc: '100% hands-on labs — every concept is applied immediately with real enterprise tools.' },
              { title: 'Industry-Designed', desc: 'Curriculum built by professionals from Google, Amazon and top tech companies.' },
              { title: 'Career Outcomes', desc: '98.4% placement success. Every program is built around real job market demands.' },
              { title: 'Global Community', desc: '15,000+ graduates across 25+ countries, with lifelong alumni support and mentorship.' },
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
        subtitle="15,000+ graduates. 98.4% placement success. Start your journey with a free demo class today."
        primaryLabel="Book Free Demo Class"
        primaryHref="/demo-class"
        secondaryLabel="View All Courses"
        secondaryHref="/courses"
      />
    </div>
  );
}
