import {
  FlaskConical, GraduationCap, User, Briefcase, Globe,
  Code2, BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const features = [
  {
    icon: FlaskConical,
    title: '100% Practical Labs',
    description: 'Every session is hands-on — real enterprise tools, live cloud sandboxes and coding exercises. Zero theory-only classes at Global Minds Academy.',
    color: 'text-brand-500',
    bg: 'bg-brand-50',
    stat: '100%',
    statLabel: 'Lab-based sessions',
  },
  {
    icon: GraduationCap,
    title: 'Global Certification',
    description: 'Industry-accredited certificates recognised by 350+ top tech enterprises across India, US, Europe and Asia Pacific.',
    color: 'text-green-500',
    bg: 'bg-green-50',
    stat: '350+',
    statLabel: 'Hiring partners',
  },
  {
    icon: User,
    title: '1-on-1 Mentorship',
    description: 'Personal mentors — senior software architects and AI researchers — guide you through every stage of your learning and career transition.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    stat: '4.9 / 5',
    statLabel: 'Mentor rating',
  },
  {
    icon: Briefcase,
    title: '98.4% Placement Success',
    description: '98.4% of our graduates land tech roles within 6 months. Dedicated placement team, resume prep, mock interviews and direct referrals.',
    color: 'text-accent-500',
    bg: 'bg-accent-50',
    stat: '98.4%',
    statLabel: 'Placement within 6 mo.',
  },
  {
    icon: Code2,
    title: 'Enterprise Capstone Projects',
    description: 'Build portfolio-grade projects — Smart Employee Management (Spring Boot), AI Healthcare Assistant (PyTorch), Cloud E-Commerce (AWS EC2/RDS/S3).',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    stat: '3+',
    statLabel: 'Projects per track',
  },
  {
    icon: Globe,
    title: '15,000+ Global Graduates',
    description: 'Join a worldwide alumni network spanning India, US, Europe and Asia Pacific, with continuous peer learning and mentor support.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    stat: '25+',
    statLabel: 'Countries reached',
  },
];

// Real capstone stack cards from GMA website
const capstoneTracks = [
  {
    title: 'Full Stack Java Spring Boot & React',
    project: 'Smart Employee Management System',
    desc: 'Role-based login, attendance, payroll, leave management, notifications, REST APIs, JWT auth.',
    stack: ['Java 21', 'Spring Boot', 'Spring Security', 'React', 'Vite', 'MySQL', 'JWT'],
    color: 'border-brand-200 bg-brand-50',
    badge: 'bg-brand-100 text-brand-700',
    href: '/courses/java-full-stack',
  },
  {
    title: 'AI & Machine Learning Masterclass',
    project: 'AI Healthcare Assistant',
    desc: 'Disease prediction, medical image classification, chatbot using LLM, explainable AI dashboard.',
    stack: ['Python', 'PyTorch', 'TensorFlow', 'OpenCV', 'Hugging Face', 'Streamlit'],
    color: 'border-purple-200 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
    href: '/courses/machine-learning',
  },
  {
    title: 'AWS Cloud Architect Track',
    project: 'Cloud-Based E-Commerce Deployment',
    desc: 'Deploy scalable e-commerce app using EC2, RDS, S3, CloudFront, Load Balancer, Auto Scaling, CI/CD.',
    stack: ['AWS EC2', 'RDS', 'S3', 'Lambda', 'Docker', 'Terraform', 'Jenkins'],
    color: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    href: '/courses/aws-training',
  },
];

export function WhyUsSection() {
  return (
    <>
      {/* ── Why Choose GMA ──────────────────────────────── */}
      <section className="section bg-white" aria-label="Why choose Global Minds Academy">
        <div className="container-xl">
          <div className="text-center mb-16">
            <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">
              The Global Minds Advantage
            </p>
            <h2 className="display-md">
              Why Learners Choose{' '}
              <span className="text-gradient">Global Minds Academy</span>
            </h2>
            <p className="text-surface-500 mt-4 max-w-2xl mx-auto">
              Built by industry architects from Google, Amazon and top tech firms — every program is engineered for real-world outcomes, not just certificates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-surface-100 hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform', feature.bg)}>
                    <feature.icon className={cn('w-6 h-6', feature.color)} />
                  </div>
                  <div className="text-right ml-auto">
                    <div className={cn('text-xl font-black', feature.color)}>{feature.stat}</div>
                    <div className="text-xs text-surface-400">{feature.statLabel}</div>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-surface-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-brand-700 to-brand-600 text-white text-center">
            <p className="text-xl font-display font-bold mb-2">
              Curriculum designed by industry leads from Google, Amazon and top tech companies
            </p>
            <p className="text-brand-100 text-sm">
              Using Java 21, Spring Boot, React, PyTorch — the exact stack top companies hire for.
            </p>
          </div>
        </div>
      </section>

      {/* ── Real Capstone Portfolio Section ─────────────── */}
      <section className="section bg-surface-50" aria-label="Capstone portfolio projects">
        <div className="container-xl">
          <div className="text-center mb-12">
            <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">Real-World Capstone Portfolio</p>
            <h2 className="display-md mb-4">
              Projects That Get You{' '}
              <span className="text-gradient">Hired</span>
            </h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              Every Global Minds track includes enterprise-grade capstone projects designed to build an impressive GitHub portfolio and land top-tier tech jobs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capstoneTracks.map(track => (
              <Link to={track.href} key={track.title} className={`rounded-2xl border-2 p-6 hover:shadow-card-lg transition-all hover:-translate-y-1 ${track.color}`}>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${track.badge} mb-3 inline-block`}>
                  Capstone Project
                </span>
                <h3 className="font-display font-bold text-surface-900 mb-1 leading-snug">{track.title}</h3>
                <p className="text-sm font-semibold text-brand-700 mb-2">📁 {track.project}</p>
                <p className="text-sm text-surface-600 mb-4 leading-relaxed">{track.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {track.stack.map(s => (
                    <span key={s} className="text-xs bg-white border border-surface-200 text-surface-700 px-2 py-0.5 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-brand-600 text-sm font-semibold">
                  <BookOpen className="w-4 h-4" />
                  View Course →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
