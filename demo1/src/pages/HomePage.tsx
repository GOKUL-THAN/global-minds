import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { PopularCategories } from '../components/home/PopularCategories';
import { FeaturedCourses } from '../components/home/FeaturedCourses';
import { MasterProgramsSection } from '../components/home/MasterProgramsSection';
import { LearningModesSection } from '../components/home/LearningModesSection';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { HomeContactSection } from '../components/home/HomeContactSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { BlogSection } from '../components/home/BlogSection';
import { CTASection } from '../components/home/CTASection';
import { FAQAccordion } from '../components/ui/FAQAccordion';
import { globalFAQs } from '../data/faqs';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';
import { useEffect } from 'react';
import { organizationSchema, faqPageSchema, injectStructuredData } from '../utils/structuredData';
import { useCmsCollection } from '../hooks/useCmsCollection';

function CorporateTrainingSection() {
  return (
    <section className="section bg-surface-50" aria-label="Corporate training">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 mb-4">
              <Building2 className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-brand-700">Enterprise Learning</span>
            </div>
            <h2 className="display-md mb-4">
              Corporate Training{' '}
              <span className="text-gradient">for Teams</span>
            </h2>
            <p className="text-surface-500 leading-relaxed mb-6">
              Customised corporate training programs designed for your team's specific technology needs. From cloud and DevOps to AI, data science and software testing.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Customised curriculum aligned to your tech stack',
                'Flexible delivery — online, on-site or hybrid',
                'Dedicated trainer for your team',
                'Progress tracking and reporting',
                'Certification support',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-surface-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/corporate-training">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Request Corporate Training
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Building2, title: 'Enterprise Training', desc: 'End-to-end tech training for large teams', color: 'bg-brand-50 text-brand-600' },
              { icon: GraduationCap, title: 'Custom Curriculum', desc: 'Built around your specific requirements', color: 'bg-green-50 text-green-600' },
              { icon: Briefcase, title: 'All Technologies', desc: 'Cloud, DevOps, AI, testing and more', color: 'bg-purple-50 text-purple-600' },
              { icon: ArrowRight, title: 'Measurable ROI', desc: 'Track progress and outcomes', color: 'bg-accent-50 text-accent-600' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-card-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-surface-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InternshipCTASection() {
  return (
    <section className="section bg-gradient-to-br from-brand-50 to-purple-50" aria-label="Internship opportunities">
      <div className="container-xl text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="display-md mb-4">
            Start Your Career with an{' '}
            <span className="text-gradient">Internship</span>
          </h2>
          <p className="text-surface-500 mb-8">
            Gain real industry experience through our internship programs in cloud engineering, DevOps, full stack development, data science, QA and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/internships">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore Internships
              </Button>
            </Link>
            <Link to="/career">
              <Button size="lg" variant="secondary">
                Career Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = useCmsCollection('faqs', globalFAQs);
  return (
    <section className="section bg-white" aria-label="Frequently asked questions">
      <div className="container-xl">
        <div className="text-center mb-12">
          <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">FAQs</p>
          <h2 className="display-md">
            Frequently Asked{' '}
            <span className="text-gradient">Questions</span>
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion faqs={faqs.slice(0, 8)} />
          <div className="text-center mt-8">
            <Link to="/contact" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
              Have more questions? Contact us →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const faqs = useCmsCollection('faqs', globalFAQs);
  usePageMeta({});

  useEffect(() => {
    injectStructuredData(organizationSchema(), 'sd-org');
    injectStructuredData(faqPageSchema(faqs.slice(0, 8).map(f => ({ question: f.question, answer: f.answer }))), 'sd-faq-home');
    return () => {
      ['sd-org', 'sd-faq-home'].forEach(id => document.getElementById(id)?.remove());
    };
  }, [faqs]);
  return (
    <div className="home-experience">
      <HeroSection />
      <StatsSection />
      <FeaturedCourses />
      <WhyUsSection />
      <PopularCategories />
      <MasterProgramsSection />
      <LearningModesSection />
      <CorporateTrainingSection />
      <InternshipCTASection />
      <TestimonialsSection />
      <BlogSection />
      <HomeContactSection />
      <FAQSection />
      <CTASection
        title="Ready to Transform Your Career?"
        subtitle="Explore practical technology training, mentor-led learning, and career-focused programs at Global Minds Academy."
        primaryLabel="Start Learning Today"
        primaryHref="/register"
        secondaryLabel="View All Courses"
        secondaryHref="/courses"
        variant="light"
      />
    </div>
  );
}
