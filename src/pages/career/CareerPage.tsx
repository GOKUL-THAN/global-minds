import { FileText, Users, Mic, BookOpen, Linkedin, Github, Target, CheckCircle } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CTASection } from '../../components/home/CTASection';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';
import { SpotlightCard } from '../../components/ui/SpotlightCard';

const careerServices = [
  { icon: FileText, title: 'Resume Building', desc: 'Craft an ATS-friendly resume that highlights your technical skills, projects and certifications.' },
  { icon: Linkedin, title: 'LinkedIn Profile', desc: 'Optimise your LinkedIn profile to attract recruiters and showcase your professional brand.' },
  { icon: Github, title: 'GitHub Portfolio', desc: 'Build a strong GitHub portfolio with your project code and documentation.' },
  { icon: Mic, title: 'Mock Interviews', desc: 'Realistic mock interviews covering technical and HR rounds with detailed feedback.' },
  { icon: Users, title: 'Career Counseling', desc: 'One-on-one sessions to define your career path, set goals and plan your job search.' },
  { icon: BookOpen, title: 'Interview Preparation', desc: 'Topic-wise technical interview prep covering DSA, system design, cloud, DevOps and more.' },
  { icon: Target, title: 'Aptitude Training', desc: 'Quantitative, logical and verbal aptitude preparation for campus and company placement drives.' },
  { icon: CheckCircle, title: 'Job Search Guidance', desc: 'Guidance on where to search, how to apply and how to negotiate offers.' },
];

export default function CareerPage() {
  usePageMeta({
    title: 'Career & Placement Support',
    description: 'Dedicated career support including resume building, LinkedIn guidance, mock interviews and job search assistance for IT professionals.',
  });
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Career & Placement' }]} className="mb-4" />
          <div className="page-hero-badge mb-4">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <ShinyText text="Dedicated Placement Cell" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title display-lg font-extrabold mb-4">
            Career &amp; <DecryptedText text="Placement Support" speed={30} maxIterations={10} className="page-hero-highlight" />
          </h1>
          <p className="page-hero-desc text-lg sm:text-xl max-w-2xl">
            Dedicated career support to help you land your dream IT job — from resume building to mock interviews, salary negotiation, and direct recruiter connections.
          </p>
          <p className="text-surface-600 text-xs sm:text-sm mt-3 font-medium">
            * We provide comprehensive career guidance and placement assistance. Outcomes depend on individual performance and market conditions.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-md mb-4">Comprehensive Career Support</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careerServices.map(s => (
              <SpotlightCard key={s.title} className="h-full">
                <div className="p-6 rounded-2xl border border-surface-200 bg-white hover:border-brand-300 hover:shadow-card-md transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                      <s.icon className="w-6 h-6 text-brand-600" />
                    </div>
                    <h3 className="font-semibold text-surface-900 mb-2">{s.title}</h3>
                    <p className="text-surface-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="display-md mb-4">Our Career Preparation Process</h2>
              <ol className="space-y-4">
                {[
                  'Complete your course or master program with all projects',
                  'Resume preparation with career team feedback',
                  'LinkedIn and GitHub profile optimisation',
                  'Technical interview preparation (domain-specific)',
                  'HR and behavioural interview coaching',
                  'Mock interview sessions with detailed feedback',
                  'Aptitude and communication training',
                  'Job search strategy and application guidance',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-surface-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-card">
              <EnquiryForm title="Get Career Counseling" subtitle="Free 1-on-1 career counseling session with our experts." compact />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Launch Your IT Career?"
        subtitle="Join a Global Minds Academy course and get full career support from day one."
        primaryLabel="Explore Courses"
        primaryHref="/courses"
        secondaryLabel="Book Free Counseling"
        secondaryHref="/contact"
      />
    </div>
  );
}
