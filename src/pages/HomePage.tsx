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
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { Magnetic } from '../components/ui/Magnetic';
import { ShinyText } from '../components/ui/ShinyText';
import { usePageMeta } from '../hooks/usePageMeta';
import { useEffect } from 'react';
import { organizationSchema, injectStructuredData } from '../utils/structuredData';

function InternshipCTASection() {
  return (
    <section className="section bg-gradient-to-br from-brand-50 to-purple-50" aria-label="Internship opportunities">
      <div className="container-xl text-center">
        <SpotlightCard className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-surface-200/80 bg-white/80 p-8 shadow-card-lg backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <Briefcase className="h-8 w-8 text-brand-600" />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-700">
              <ShinyText text="🚀 Real Industry Experience" shinyColor="rgba(23, 108, 115, 0.9)" />
            </p>
            <h2 className="display-md mb-4 text-surface-900">
              Build Experience Through an <span className="text-gradient">Internship</span>
            </h2>
            <p className="mb-8 text-surface-700 font-medium leading-relaxed">
              Explore internships related to AWS / Cloud, Data Science, Machine Learning, Full Stack Development,
              Software Testing, and Automation Testing.
            </p>
            <Link to="/internships">
              <Magnetic>
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Explore Internships
                </Button>
              </Magnetic>
            </Link>
          </div>
        </SpotlightCard>
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
