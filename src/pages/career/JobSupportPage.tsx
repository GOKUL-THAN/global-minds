import { Link } from 'react-router-dom';
import { Briefcase, Search, FileText, Users, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CTASection } from '../../components/home/CTASection';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';
import { SpotlightCard } from '../../components/ui/SpotlightCard';

const services = [
  { icon: Search, title: 'Job Search Strategy', desc: 'Targeted guidance on where to look for IT jobs, how to apply effectively and how to stand out from other candidates.' },
  { icon: FileText, title: 'Application Support', desc: 'Help with writing cover letters, tailoring resumes for each role and tracking your applications.' },
  { icon: Users, title: 'Recruiter Connections', desc: 'Guidance on building recruiter relationships on LinkedIn and using job portals effectively.' },
  { icon: Target, title: 'Offer Negotiation', desc: 'Tips on evaluating job offers, negotiating salary and understanding compensation packages.' },
  { icon: Briefcase, title: 'Company Research', desc: 'How to research companies, understand their tech stack and tailor your approach for each employer.' },
  { icon: CheckCircle, title: 'Onboarding Preparation', desc: 'Prepare for your first 30-60-90 days in a new role with confidence and a clear plan.' },
];

export default function JobSupportPage() {
  usePageMeta({
    title: 'Job Search Support & Career Guidance',
    description: 'Job search support, application guidance, offer negotiation tips and career transition assistance for IT professionals.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16">
        <div className="container-xl relative z-10">
          <Breadcrumbs
            items={[{ label: 'Career', href: '/career' }, { label: 'Job Support' }]}
            className="mb-4"
          />
          <div className="page-hero-badge mb-4">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <ShinyText text="End-to-End Application Guidance" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title display-lg font-extrabold mb-4">
            Job Search <DecryptedText text="Support" speed={30} maxIterations={10} className="page-hero-highlight" />
          </h1>
          <p className="page-hero-desc text-lg sm:text-xl max-w-2xl">
            Practical guidance to help you navigate the IT job market effectively — from uncovering opportunities to acing interviews and accepting top offers.
          </p>
          <p className="text-surface-600 text-xs sm:text-sm mt-3 font-medium">
            * Career support service — outcomes depend on individual effort and market conditions.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {services.map(s => (
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

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="display-md mb-6">How We Support Your Job Search</h2>
              <ol className="space-y-4">
                {[
                  'Complete your training program and capstone projects',
                  'Build a strong resume with career team guidance',
                  'Optimise your LinkedIn and GitHub profiles',
                  'Create a targeted list of companies and roles',
                  'Apply with tailored applications and cover letters',
                  'Prepare for interviews (technical + HR)',
                  'Handle offers — negotiation and evaluation',
                  'Start your new role with confidence',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-surface-700 mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/career">
                  <button className="btn-primary btn flex items-center gap-2">Career Overview <ArrowRight className="w-4 h-4" /></button>
                </Link>
                <Link to="/courses">
                  <button className="btn-secondary btn">Browse Courses</button>
                </Link>
              </div>
            </div>

            <div className="bg-surface-50 rounded-3xl p-8">
              <EnquiryForm title="Talk to Our Career Team" subtitle="Get personalised job search guidance from our career counselors." compact />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Your IT Career Starts Here"
        subtitle="Complete a course, build real projects and get job search support all in one place."
        primaryLabel="Explore Courses"
        primaryHref="/courses"
        secondaryLabel="Contact Career Team"
        secondaryHref="/contact"
      />
    </div>
  );
}
