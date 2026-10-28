import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { FeaturedCourses } from '../components/home/FeaturedCourses';
import { MasterProgramsSection } from '../components/home/MasterProgramsSection';
import { CapstoneProjectsSection } from '../components/home/CapstoneProjectsSection';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { LearningModesSection } from '../components/home/LearningModesSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { GoogleReviewsCarousel } from '../components/home/GoogleReviewsCarousel';
import { HomeContactSection } from '../components/home/HomeContactSection';
import { CTASection } from '../components/home/CTASection';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';
import { useEffect } from 'react';
import { organizationSchema, injectStructuredData } from '../utils/structuredData';

function InternshipCTASection() {
  return (
    <section className="section bg-gradient-to-br from-brand-50 to-purple-50" aria-label="Internship opportunities">
      <div className="container-xl text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
            <Briefcase className="h-8 w-8 text-brand-600" />
          </div>
          <h2 className="display-md mb-4">
            Build Experience Through an <span className="text-gradient">Internship</span>
          </h2>
          <p className="mb-8 text-surface-700 font-medium">
            Explore internships related to AWS / Cloud, Data Science, Machine Learning, Full Stack Development,
            Software Testing, and Automation Testing.
          </p>
          <Link to="/internships">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Explore Internships
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageMeta({});

  useEffect(() => {
    injectStructuredData(organizationSchema(), 'sd-org');
    return () => {
      document.getElementById('sd-org')?.remove();
    };
  }, []);
  return (
    <div className="home-experience">
      {/* Hook & Trust */}
      <HeroSection />
      <StatsSection />

      {/* Course Discovery */}
      <FeaturedCourses />
      <MasterProgramsSection />
      <CapstoneProjectsSection />
      <WhyUsSection />

      {/* Learning options */}
      <LearningModesSection />

      {/* Social proof */}
      <InternshipCTASection />
      <TestimonialsSection />
      <GoogleReviewsCarousel />

      {/* Conversion */}
      <HomeContactSection />
      <CTASection
        title="Ready to build your next skill?"
        subtitle="Choose a course, talk to our team, or book a free demo to decide what fits your goals."
        primaryLabel="Explore Courses"
        primaryHref="/courses"
        secondaryLabel="Book a Free Demo"
        secondaryHref="/demo-class"
      />
    </div>
  );
}
