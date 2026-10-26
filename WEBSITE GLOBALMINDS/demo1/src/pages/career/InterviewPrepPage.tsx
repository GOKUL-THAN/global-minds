import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Users, Brain, Target, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CTASection } from '../../components/home/CTASection';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { usePageMeta } from '../../hooks/usePageMeta';

const topics = [
  {
    category: 'Technical Fundamentals',
    icon: Code2,
    color: 'bg-brand-50 text-brand-600',
    href: '/master-programs/freshers-master-program',
    details: 'Global Minds Academy Freshers Master Program builds core technical fundamentals through data structures, algorithms, object-oriented programming, SQL, and networking essentials—designed for freshers preparing for real IT roles and technical interviews.',
    items: ['Data Structures & Algorithms', 'System Design basics', 'Object-Oriented Programming', 'SQL & databases', 'Computer Networks basics'],
  },
  {
    category: 'Domain-Specific',
    icon: Target,
    color: 'bg-purple-50 text-purple-600',
    href: '/courses',
    details: 'Prepare for the technologies used in your target role, with focused practice in cloud platforms, delivery pipelines, application frameworks, testing and data tools.',
    items: ['Cloud (AWS / Azure / GCP)', 'DevOps & CI/CD', 'Java / Python / JavaScript', 'React / Node.js', 'Testing & QA', 'Data Science / AI'],
  },
  {
    category: 'HR & Behavioral',
    icon: Users,
    color: 'bg-green-50 text-green-600',
    href: '/career/mock-interview',
    details: 'Practice structured responses using the STAR method, discuss strengths and career goals, and prepare for compensation and company-fit questions.',
    items: ['Tell me about yourself', 'Strength & weakness', 'Situation-based questions (STAR)', 'Salary discussion', 'Why this company?'],
  },
  {
    category: 'Aptitude & Reasoning',
    icon: Brain,
    color: 'bg-accent-50 text-accent-600',
    href: '/skill-assessment',
    details: 'Build speed and accuracy with quantitative, verbal and logical reasoning exercises, then use problem-solving practice to prepare for timed assessments.',
    items: ['Quantitative aptitude', 'Logical reasoning', 'Verbal ability', 'Problem-solving', 'Pattern recognition'],
  },
];

export default function InterviewPrepPage() {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  usePageMeta({
    title: 'Interview Preparation — Technical & HR',
    description: 'Comprehensive interview preparation covering technical fundamentals, domain-specific questions, HR rounds, aptitude and behavioral interviews.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-14">
        <div className="container-xl">
          <Breadcrumbs
            items={[{ label: 'Career', href: '/career' }, { label: 'Interview Preparation' }]}
            className="text-white/50 mb-4"
          />
          <h1 className="display-lg text-white mb-4">Interview Preparation</h1>
          <p className="text-white/70 text-xl max-w-2xl">
            Structured interview preparation for technical, HR and aptitude rounds — domain-specific coaching aligned to the roles you're targeting.
          </p>
        </div>
      </div>

      {/* Topic coverage */}
      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-md mb-4">What We Cover</h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Comprehensive preparation across all interview formats you'll encounter in the IT hiring process.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {topics.map(t => {
              const isExpanded = expandedTopics.has(t.category);
              const detailsId = `prep-details-${t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              return (
              <article key={t.category} className="bg-white rounded-3xl p-6 border border-surface-100 hover:shadow-card-md transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t.color}`}>
                  <t.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-surface-900 text-lg mb-4">{t.category}</h3>
                <ul className="space-y-2">
                  {t.items.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-surface-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div id={detailsId} hidden={!isExpanded} className="mt-4 rounded-xl bg-surface-50 p-4 text-sm text-surface-600">
                  {t.details}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => setExpandedTopics(current => {
                      const next = new Set(current);
                      if (next.has(t.category)) next.delete(t.category);
                      else next.add(t.category);
                      return next;
                    })}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  >
                    {isExpanded ? 'Hide details' : 'Show details'}
                  </button>
                  <Link to={t.href} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
                    Explore preparation <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process + form */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="display-md mb-6">Our Interview Prep Approach</h2>
              <div className="space-y-5">
                {[
                  { step: '01', title: 'Role Analysis', desc: 'We analyse the job description and company to understand exactly what they test.' },
                  { step: '02', title: 'Topic Coverage', desc: 'Structured preparation across technical, domain-specific, aptitude and HR rounds.' },
                  { step: '03', title: 'Practice Questions', desc: 'Real interview questions from top IT companies — practised in a safe environment.' },
                  { step: '04', title: 'Mock Interview', desc: 'Full mock interview with feedback on your answers, body language and communication.' },
                  { step: '05', title: 'Final Refinement', desc: 'Address weak spots identified in the mock before your real interview.' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <span className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-semibold text-surface-900 mb-0.5">{item.title}</h4>
                      <p className="text-surface-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/career/mock-interview">
                  <button className="btn-primary btn flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Book Mock Interview
                  </button>
                </Link>
                <Link to="/courses">
                  <button className="btn-secondary btn">Browse Courses</button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-card">
              <EnquiryForm title="Start Interview Preparation" subtitle="Tell us your target role and we'll create a personalised prep plan." compact />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Crack Your Next Interview"
        subtitle="Structured preparation, mock interviews and expert feedback — all aligned to your target role."
        primaryLabel="Get Started"
        primaryHref="/register"
        secondaryLabel="View Courses"
        secondaryHref="/courses"
      />
    </div>
  );
}
