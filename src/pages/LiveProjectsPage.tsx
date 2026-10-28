import { Link } from 'react-router-dom';
import { Code2, Star, Trophy, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCmsCollection } from '../hooks/useCmsCollection';
import { ShinyText } from '../components/ui/ShinyText';
import { DecryptedText } from '../components/ui/DecryptedText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { PixelCard } from '../components/ui/PixelCard';
import { CountUp } from '../components/ui/CountUp';

// ── Project Categories ─────────────────────────────────────
const projectCategories = [
  {
    id: 'fullstack',
    title: 'Full Stack Projects',
    icon: '💻',
    color: 'bg-brand-50 border-brand-200',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-600',
    count: 50,
    projects: [
      {
        title: 'E-Commerce Platform',
        stack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        difficulty: 'Advanced',
        description: 'Full-featured online store with product catalog, cart, checkout, payments and admin dashboard.',
        outcomes: ['REST API design', 'Authentication & JWT', 'Payment integration', 'Admin panel'],
      },
      {
        title: 'Job Portal Application',
        stack: ['Next.js', 'PostgreSQL', 'Prisma', 'Tailwind'],
        difficulty: 'Intermediate',
        description: 'Job listing and application portal with recruiter and candidate portals, search and filters.',
        outcomes: ['Full-stack Next.js', 'Database design', 'File uploads', 'Role-based access'],
      },
      {
        title: 'Real-Time Chat App',
        stack: ['React', 'Socket.io', 'Node.js', 'Redis'],
        difficulty: 'Intermediate',
        description: 'Slack-style group chat with private messages, channels, file sharing and online status.',
        outcomes: ['WebSocket communication', 'Real-time updates', 'Message persistence', 'User presence'],
      },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud Projects',
    icon: '☁️',
    color: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    count: 50,
    projects: [
      {
        title: 'CI/CD Pipeline on AWS',
        stack: ['GitHub Actions', 'Docker', 'ECR', 'ECS'],
        difficulty: 'Intermediate',
        description: 'End-to-end CI/CD pipeline that builds, tests and deploys a Node.js app to AWS ECS on every commit.',
        outcomes: ['GitHub Actions workflows', 'Docker containerisation', 'AWS ECS deployment', 'Zero-downtime deploys'],
      },
      {
        title: 'Infrastructure as Code with Terraform',
        stack: ['Terraform', 'AWS', 'VPC', 'EC2'],
        difficulty: 'Advanced',
        description: 'Provision a complete AWS VPC with subnets, security groups, EC2 instances and RDS using Terraform.',
        outcomes: ['Terraform modules', 'State management', 'AWS networking', 'Security groups'],
      },
      {
        title: 'Kubernetes Microservices Deployment',
        stack: ['Kubernetes', 'Helm', 'Prometheus', 'Grafana'],
        difficulty: 'Advanced',
        description: 'Deploy a multi-service application on Kubernetes with autoscaling, service mesh and monitoring.',
        outcomes: ['Kubernetes objects', 'Helm charts', 'HPA & VPA', 'Observability'],
      },
    ],
  },
  {
    id: 'datascience',
    title: 'Data Science & AI Projects',
    icon: '🧠',
    color: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    count: 50,
    projects: [
      {
        title: 'Customer Churn Prediction',
        stack: ['Python', 'Scikit-learn', 'Pandas', 'Streamlit'],
        difficulty: 'Intermediate',
        description: 'Predict telecom customer churn using machine learning and deploy an interactive Streamlit dashboard.',
        outcomes: ['EDA', 'Feature engineering', 'Model selection', 'Deployment with Streamlit'],
      },
      {
        title: 'Sentiment Analysis Pipeline',
        stack: ['Python', 'BERT', 'Hugging Face', 'FastAPI'],
        difficulty: 'Advanced',
        description: 'NLP pipeline that classifies product reviews as positive/negative/neutral using BERT fine-tuning.',
        outcomes: ['NLP preprocessing', 'Transformer models', 'Model fine-tuning', 'REST API serving'],
      },
      {
        title: 'Sales Dashboard with Power BI',
        stack: ['Power BI', 'DAX', 'SQL', 'Excel'],
        difficulty: 'Beginner',
        description: 'Interactive sales analytics dashboard with KPIs, drill-downs, and forecasting using Power BI.',
        outcomes: ['Power Query', 'DAX measures', 'Visual design', 'Data modelling'],
      },
    ],
  },
  {
    id: 'testing',
    title: 'Testing & QA Projects',
    icon: '🧪',
    color: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    count: 50,
    projects: [
      {
        title: 'Selenium Test Automation Framework',
        stack: ['Selenium', 'TestNG', 'Java', 'Maven'],
        difficulty: 'Intermediate',
        description: 'Page Object Model-based automation framework for an e-commerce site with reports and CI integration.',
        outcomes: ['POM design pattern', 'Data-driven testing', 'Extent Reports', 'Jenkins integration'],
      },
      {
        title: 'API Testing with Rest Assured',
        stack: ['Rest Assured', 'Java', 'Postman', 'Newman'],
        difficulty: 'Intermediate',
        description: 'Comprehensive API test suite covering CRUD operations, authentication and error scenarios.',
        outcomes: ['HTTP methods testing', 'Schema validation', 'Auth testing', 'Newman CLI reports'],
      },
      {
        title: 'Performance Testing with JMeter',
        stack: ['JMeter', 'Grafana', 'InfluxDB', 'BlazeMeter'],
        difficulty: 'Advanced',
        description: 'Load and stress testing a REST API with real-time performance monitoring and reporting.',
        outcomes: ['Load test plans', 'Distributed testing', 'Real-time metrics', 'Performance analysis'],
      },
    ],
  },
];

// ── Alumni Projects ────────────────────────────────────────
const alumniProjects = [
  {
    title: 'MediBook – Doctor Appointment App',
    author: 'Priya Sharma',
    course: 'Full Stack Development',
    stack: ['React', 'Node.js', 'MongoDB'],
    stars: 142,
    placed: 'Amazon',
    color: 'bg-brand-500',
  },
  {
    title: 'AutoDeploy – GitHub to Kubernetes in 1 Click',
    author: 'Rahul Mehta',
    course: 'DevOps Training',
    stack: ['Python', 'Kubernetes', 'Terraform'],
    stars: 89,
    placed: 'Microsoft',
    color: 'bg-orange-500',
  },
  {
    title: 'StockSense – AI Stock Market Predictor',
    author: 'Anjali Nair',
    course: 'Data Science & AI',
    stack: ['Python', 'LSTM', 'Streamlit'],
    stars: 213,
    placed: 'Google',
    color: 'bg-purple-500',
  },
  {
    title: 'BugTrail – Automated Bug Report Generator',
    author: 'Suresh Kumar',
    course: 'Software Testing',
    stack: ['Selenium', 'Python', 'Jira API'],
    stars: 67,
    placed: 'Infosys',
    color: 'bg-green-500',
  },
];

const difficultyColor = (level: string) => {
  switch (level) {
    case 'Beginner': return 'bg-green-100 text-green-700';
    case 'Intermediate': return 'bg-orange-100 text-orange-700';
    case 'Advanced': return 'bg-red-100 text-red-700';
    default: return 'bg-surface-100 text-surface-600';
  }
};

export default function LiveProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const visibleProjectCategories = useCmsCollection('live-projects', projectCategories);

  usePageMeta({
    title: 'Live Industry Projects',
    description: 'Work on real-world live projects at Global Minds Academy. Build your portfolio with full-stack, DevOps, data science and testing projects that impress employers.',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-20 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <div className="flex justify-center">
            <Breadcrumbs items={[{ label: 'Live Projects' }]} className="mb-4" />
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <div className="page-hero-badge inline-flex items-center gap-2 mb-6">
              <Trophy className="w-4 h-4 text-amber-300" />
              <ShinyText text="50+ Industry-Grade Projects" shinyColor="rgba(217, 161, 11, 0.95)" />
            </div>
            <h1 className="page-hero-title mb-5">
              Build Real Projects.<br />
              <DecryptedText text="Impress Employers." speed={30} maxIterations={10} className="page-hero-highlight" />
            </h1>
            <p className="page-hero-desc mx-auto max-w-3xl text-lg sm:text-xl mb-8 leading-relaxed">
              Every course includes live, industry-grade projects designed to fill your GitHub portfolio and give you the practical experience that gets you hired.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/courses"><Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md shadow-teal-900/20">Explore Courses</Button></Link>
              <Link to="/demo-class"><Button variant="secondary" className="bg-white border-teal-600/30 text-teal-800 hover:bg-teal-50 font-semibold shadow-sm">Book Free Demo</Button></Link>
            </div>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { value: '50+', label: 'Project Templates', icon: '📁' },
              { value: '120+', label: 'Portfolio Builds', icon: '🚀' },
              { value: '95%', label: 'Hire Rate (with project)', icon: '🎯' },
              { value: '4.8★', label: 'Average Rating', icon: '⭐' },
            ].map(s => (
              <SpotlightCard key={s.label}>
                <div className="page-hero-chip flex flex-col items-center justify-center p-4 text-center h-full">
                  <div className="text-2xl mb-1.5" aria-hidden="true">{s.icon}</div>
                  <div className="font-display font-bold text-2xl text-white">
                    {s.value === '50+' ? <CountUp end={50} suffix="+" start />
                      : s.value === '120+' ? <CountUp end={120} suffix="+" start />
                      : s.value === '95%' ? <CountUp end={95} suffix="%" start />
                      : s.value}
                  </div>
                  <div className="text-xs text-teal-200/90 font-medium mt-1">{s.label}</div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>

      {/* Why projects matter */}
      <section className="section bg-white border-b border-surface-200">
        <div className="container-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🎯', title: 'Close the Gap', desc: 'Bridge the gap between theory and what employers actually need.' },
              { icon: '📂', title: 'Build Portfolio', desc: 'Every project goes to your GitHub — evidence of real skills.' },
              { icon: '🤝', title: 'Team Collaboration', desc: 'Work with peers using Git, code reviews and Agile sprints.' },
              { icon: '💼', title: 'Resume Power', desc: 'Projects are the #1 factor in early-career hiring decisions.' },
            ].map(w => (
              <div key={w.title} className="p-6 rounded-2xl bg-surface-50 border border-surface-200 hover:border-brand-300 transition-all">
                <div className="text-3xl mb-3">{w.icon}</div>
                <h3 className="font-semibold text-surface-900 mb-2">{w.title}</h3>
                <p className="text-sm text-surface-700 font-medium leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Categories */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-bold text-brand-700 uppercase tracking-wider mb-3">Project Library</span>
            <h2 className="display-md mb-4">Projects by Domain</h2>
            <p className="text-surface-600 font-medium max-w-2xl mx-auto">
              Choose from 50+ real-world project templates across all tech domains. Each project comes with guided instructions, starter code, and a review session.
            </p>
          </div>
          <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter projects by domain">
            {[
              { id: 'all', label: 'All domains' },
              { id: 'fullstack', label: 'Full Stack & Web' },
              { id: 'datascience', label: 'AI & Data Science' },
              { id: 'devops', label: 'Cloud & DevOps' },
              { id: 'testing', label: 'Testing & QA' },
            ].map(filter => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveCategory(filter.id)}
                aria-pressed={activeCategory === filter.id}
                className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${activeCategory === filter.id
                  ? 'border-brand-700 bg-brand-700 text-white shadow-sm'
                  : 'border-surface-300 bg-white text-surface-700 hover:border-brand-500 hover:text-brand-800'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="space-y-10">
            {visibleProjectCategories.filter(cat => activeCategory === 'all' || cat.id === activeCategory).map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 ${cat.iconBg} rounded-xl flex items-center justify-center`}>
                    <span className="text-lg">{cat.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-surface-900">{cat.title}</h3>
                    <p className="text-sm text-surface-600 font-medium">{cat.count}+ projects available</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  {cat.projects.map(proj => (
                    <SpotlightCard key={proj.title} className="h-full">
                      <div className={`rounded-2xl border-2 p-6 ${cat.color} hover:shadow-card-md transition-shadow bg-white h-full flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-surface-900 flex-1 leading-snug">{proj.title}</h4>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ml-2 flex-shrink-0 ${difficultyColor(proj.difficulty)}`}>
                              {proj.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-surface-700 font-medium mb-4">{proj.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {proj.stack.map(tech => (
                              <span key={tech} className="text-xs bg-white border border-surface-300 text-surface-800 font-semibold px-2 py-0.5 rounded-full">{tech}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-surface-800 mb-2 uppercase tracking-wide">What you'll build:</p>
                          <ul className="space-y-1">
                            {proj.outcomes.map(o => (
                              <li key={o} className="flex items-center gap-2 text-xs text-surface-700 font-medium">
                                <ArrowRight className="w-3 h-3 text-brand-600 flex-shrink-0" />
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Projects */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-bold text-brand-700 uppercase tracking-wider mb-3">Alumni Showcase</span>
            <h2 className="display-md mb-4">Projects That Got Students Hired</h2>
            <p className="text-surface-600 font-medium max-w-2xl mx-auto">Real projects by our alumni that stood out in interviews and contributed to placement at top companies.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {alumniProjects.map(p => (
              <div key={p.title} className="bg-white rounded-2xl border border-surface-200 p-6 hover:border-brand-300 hover:shadow-card-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${p.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                    {p.author.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 text-sm">{p.author}</p>
                    <p className="text-xs text-surface-600 font-medium">{p.course}</p>
                  </div>
                </div>
                <h3 className="font-semibold text-surface-900 mb-2 leading-snug">{p.title}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.stack.map(t => (
                    <span key={t} className="text-xs bg-surface-100 text-surface-700 font-medium px-2 py-0.5 rounded-full border border-surface-200">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                  <div className="flex items-center gap-1 text-xs text-surface-600 font-medium">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {p.stars} stars
                  </div>
                  <span className="text-xs font-bold text-green-800 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    Placed @ {p.placed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-sm mb-3">How Live Projects Work</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🎓', title: 'Enroll in a Course', desc: 'Every course comes with 2–3 live project assignments built into the curriculum.' },
              { step: '02', icon: '📋', title: 'Choose Your Project', desc: 'Pick from the project library or work on an assigned project with your trainer.' },
              { step: '03', icon: '💻', title: 'Build & Submit', desc: 'Code the project with guided sessions, code reviews and mentor check-ins.' },
              { step: '04', icon: '🚀', title: 'Deploy & Showcase', desc: 'Deploy your project live and add it to your GitHub portfolio and resume.' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-2xl p-6 border border-surface-200 hover:border-brand-300 text-center relative transition-all">
                <div className="absolute top-4 right-4 text-4xl font-black text-surface-200">{s.step}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-surface-900 mb-2">{s.title}</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-8">
            <h2 className="display-sm mb-3">Technologies You'll Work With</h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              'React', 'Next.js', 'Node.js', 'Python', 'Java', 'TypeScript', 'PostgreSQL', 'MongoDB',
              'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Azure', 'GitHub Actions', 'Selenium',
              'JMeter', 'Pandas', 'TensorFlow', 'Scikit-learn', 'Redis', 'GraphQL', 'REST APIs',
              'Power BI', 'Tableau', 'FastAPI', 'Spring Boot', 'Django', 'Kafka', 'Spark',
            ].map(tech => (
              <span
                key={tech}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-full text-sm text-surface-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-brand-400" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
