import { useParams, Link } from 'react-router-dom';
import {
  Clock, BarChart2, Monitor, MapPin, BadgeCheck,
  ChevronDown, ArrowRight, Phone, Download,
  CheckCircle, Briefcase, BookOpen, Target, Code2, Award,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { FAQAccordion } from '../../components/ui/FAQAccordion';
import { CourseCard } from '../../components/courses/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShinyText } from '../../components/ui/ShinyText';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { formatPrice } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { usePageMeta } from '../../hooks/usePageMeta';
import { courseSchema, faqPageSchema, breadcrumbSchema, injectStructuredData } from '../../utils/structuredData';
import { siteConfig } from '../../data/siteConfig';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { courses, loading: coursesLoading, error: coursesError } = useCourseCatalog();
  const course = courses.find(item => item.slug === (slug || ''));
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  usePageMeta({
    title: course?.metaTitle || course?.title,
    description: course?.metaDescription || course?.shortDescription,
    ogImage: course?.banner,
  });

  useEffect(() => {
    if (!course) return;
    injectStructuredData(courseSchema(course), 'sd-course');
    injectStructuredData(faqPageSchema(course.faqs), 'sd-faq');
    injectStructuredData(
      breadcrumbSchema([
        { name: 'Home', url: siteConfig.siteUrl },
        { name: 'Courses', url: `${siteConfig.siteUrl}/courses` },
        { name: course.subCategory, url: `${siteConfig.siteUrl}/categories/${course.category}` },
        { name: course.title, url: `${siteConfig.siteUrl}/courses/${course.slug}` },
      ]),
      'sd-breadcrumb'
    );
    return () => {
      ['sd-course', 'sd-faq', 'sd-breadcrumb'].forEach(id => {
        document.getElementById(id)?.remove();
      });
    };
  }, [course]);

  if (coursesLoading) {
    return <div role="status" className="min-h-screen flex items-center justify-center text-surface-500">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-3">{coursesError ? 'Courses Unavailable' : 'Course Not Found'}</h1>
          <p role={coursesError ? 'alert' : undefined} className="text-surface-500 mb-6">{coursesError || "The course you're looking for doesn't exist or has been removed."}</p>
          <Link to="/courses" className="btn-primary btn">Browse All Courses</Link>
        </div>
      </div>
    );
  }

  const relatedCourses = courses.filter(item => item.slug !== course.slug
    && (course.relatedCourses.includes(item.slug) || item.category === course.category)).slice(0, 4);
  const savings = course.price - course.discountPrice;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-14">
        <div className="container-xl relative z-10">
          <Breadcrumbs
            items={[
              { label: 'Courses', href: '/courses' },
              { label: course.subCategory, href: `/categories/${course.category}` },
              { label: course.title },
            ]}
            className="mb-4"
          />

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Course info */}
            <div className="lg:col-span-2">
              <div className="flex gap-2 mb-4">
                {course.trending && <Badge variant="accent">🔥 Trending</Badge>}
                {course.featured && <Badge variant="brand">⭐ Featured</Badge>}
                <span className="page-hero-chip text-xs py-1 px-3">{course.level}</span>
              </div>

              <h1 className="page-hero-title display-md font-extrabold mb-4">{course.title}</h1>
              <p className="page-hero-desc text-lg mb-6 leading-relaxed">{course.shortDescription}</p>
              <img
                src={course.banner}
                alt={`${course.title} course`}
                className="lg:hidden w-full aspect-[4/3] object-cover rounded-2xl mb-6 border border-white/20 shadow-xl"
              />

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                <span className="page-hero-chip">
                  <Clock className="w-4 h-4 text-teal-600" /> {course.duration}
                </span>
                <span className="page-hero-chip">
                  <BarChart2 className="w-4 h-4 text-teal-600" /> {course.level}
                </span>
                <span className="page-hero-chip">
                  <BookOpen className="w-4 h-4 text-teal-600" /> {course.modules.length} modules
                </span>
                {course.onlineAvailable && (
                  <span className="page-hero-chip"><Monitor className="w-4 h-4 text-teal-600" /> Online</span>
                )}
                {course.classroomAvailable && (
                  <span className="page-hero-chip"><MapPin className="w-4 h-4 text-teal-600" /> Classroom — Chennai</span>
                )}
              </div>

            </div>

            {/* Mobile price card preview */}
            <div className="lg:hidden bg-white border border-teal-200 rounded-2xl p-6 shadow-xl">
              <div className="text-3xl font-extrabold text-surface-900 mb-1">
                {formatPrice(course.discountPrice, course.currency)}
              </div>
              {course.discountPercentage > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-surface-500 line-through text-sm font-medium">{formatPrice(course.price, course.currency)}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{course.discountPercentage}%</span>
                </div>
              )}
              <Link to="/register">
                <Button size="lg" variant="accent" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Enroll Now
                </Button>
              </Link>
            </div>

            <div className="hidden lg:block self-center">
              <img
                src={course.banner}
                alt={`${course.title} course`}
                className="w-full aspect-[4/3] object-cover rounded-3xl border border-teal-200/70 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-xl py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="heading-xl mb-4">Course Overview</h2>
              <p className="text-surface-600 leading-relaxed">{course.longDescription}</p>
            </section>

            {/* Learning Objectives */}
            <section aria-labelledby="objectives-heading">
              <h2 id="objectives-heading" className="heading-xl mb-6">
                <Target className="inline w-6 h-6 text-brand-500 mr-2" />
                What You'll Learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-surface-700">{obj}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section aria-labelledby="curriculum-heading">
              <h2 id="curriculum-heading" className="heading-xl mb-6">
                <BookOpen className="inline w-6 h-6 text-brand-500 mr-2" />
                Curriculum
              </h2>
              <div className="space-y-3">
                {course.modules.map((module, i) => (
                  <div key={module.id} className="border border-surface-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}
                      aria-expanded={openModuleId === module.id}
                      aria-controls={`course-module-${module.id}`}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-surface-100 text-surface-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-semibold text-surface-900 text-sm text-left">{module.title}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-surface-400">{module.duration}</span>
                        <ChevronDown className={cn('w-4 h-4 text-surface-400 transition-transform', openModuleId === module.id && 'rotate-180')} />
                      </div>
                    </button>
                    <div
                      id={`course-module-${module.id}`}
                      className={cn(
                        'grid transition-[grid-template-rows] duration-200 ease-out',
                        openModuleId === module.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-surface-100 px-4 pb-3 pt-4">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                            Learning focus
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-surface-600">
                            In this module, explore {module.topics.slice(0, 3).join(', ')}, then
                            practise applying these ideas in real-world {course.title} scenarios.
                          </p>
                        </div>
                        <ol className="px-4 pb-4 space-y-2">
                          {module.topics.map((topic, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-surface-600">
                              <span className="w-6 h-6 rounded-md bg-surface-50 text-surface-500 text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                                {String(j + 1).padStart(2, '0')}
                              </span>
                              <span className="pt-0.5">{topic}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tools & Technologies */}
            <section aria-labelledby="tools-heading">
              <h2 id="tools-heading" className="heading-xl mb-4">
                <Code2 className="inline w-6 h-6 text-brand-500 mr-2" />
                Tools & Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.tools.map(tool => (
                  <span key={tool} className="px-3 py-1.5 bg-surface-100 text-surface-700 rounded-xl text-sm font-medium">
                    {tool}
                  </span>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section aria-labelledby="projects-heading">
              <h2 id="projects-heading" className="heading-xl mb-4">
                <Briefcase className="inline w-6 h-6 text-brand-500 mr-2" />
                Real-World Projects
              </h2>
              <div className="space-y-3">
                {course.projects.map((project, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                    <span className="w-7 h-7 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-surface-700 mt-1">{project}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Career Outcomes */}
            <section aria-labelledby="career-heading">
              <h2 id="career-heading" className="heading-xl mb-4">
                <Award className="inline w-6 h-6 text-brand-500 mr-2" />
                Career Opportunities
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {course.careerOutcomes.map((outcome, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-surface-50 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-surface-700">{outcome}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">Job Roles You Can Target</h3>
                <div className="flex flex-wrap gap-2">
                  {course.jobRoles.map(role => (
                    <span key={role} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-sm font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Who should join */}
            <section aria-labelledby="who-heading">
              <h2 id="who-heading" className="heading-xl mb-4">Who Should Join</h2>
              <ul className="space-y-2">
                {course.whoShouldJoin.map((who, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0" />
                    {who}
                  </li>
                ))}
              </ul>
            </section>

            {/* Prerequisites */}
            <section aria-labelledby="prereq-heading">
              <h2 id="prereq-heading" className="heading-xl mb-4">Prerequisites</h2>
              <ul className="space-y-2">
                {course.prerequisites.map((prereq, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-400 flex-shrink-0" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </section>

            {/* FAQs */}
            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="heading-xl mb-6">Frequently Asked Questions</h2>
              <FAQAccordion faqs={course.faqs} />
            </section>
          </div>

          {/* Sticky enrollment panel */}
          <div className="hidden lg:block">
            <SpotlightCard className="sticky-enroll bg-white border border-teal-200/80 rounded-3xl p-6 shadow-xl">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-display font-black text-surface-900">
                    {formatPrice(course.discountPrice, course.currency)}
                  </span>
                  {course.discountPercentage > 0 && (
                    <span className="text-surface-400 line-through text-lg">
                      {formatPrice(course.price, course.currency)}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-green-600 text-sm font-semibold">
                    <ShinyText text={`You save ${formatPrice(savings, course.currency)} (${course.discountPercentage}% off)`} shinyColor="rgba(16, 185, 129, 0.9)" />
                  </p>
                )}
              </div>

              {/* CTA buttons */}
              <div className="space-y-3 mb-6">
                <Link to="/register">
                  <Button size="lg" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Enroll Now
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  leftIcon={<Phone className="w-4 h-4" />}
                  onClick={() => document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Request Callback
                </Button>
                <Button variant="ghost" size="sm" fullWidth leftIcon={<Download className="w-4 h-4" />}>
                  Download Syllabus
                </Button>
              </div>

              {/* Course info */}
              <div className="space-y-3 border-t border-surface-100 pt-5 mb-6">
                {[
                  { label: 'Duration', value: course.duration, icon: Clock },
                  { label: 'Level', value: course.level, icon: BarChart2 },
                  { label: 'Certificate', value: 'Included', icon: BadgeCheck },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-surface-500">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    <span className="font-semibold text-surface-900">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Training modes */}
              <div className="border-t border-surface-100 pt-5 mb-5">
                <p className="text-xs font-semibold text-surface-500 uppercase mb-3">Training Modes</p>
                <div className="flex flex-col gap-2">
                  {course.onlineAvailable && (
                    <div className="flex items-center gap-2 text-sm text-surface-700">
                      <Monitor className="w-4 h-4 text-brand-500" /> Online (Live)
                    </div>
                  )}
                  {course.classroomAvailable && (
                    <div className="flex items-center gap-2 text-sm text-surface-700">
                      <MapPin className="w-4 h-4 text-green-500" /> Classroom in Chennai
                    </div>
                  )}
                  {course.oneToOneAvailable && (
                    <div className="flex items-center gap-2 text-sm text-surface-700">
                      <BadgeCheck className="w-4 h-4 text-accent-500" /> One-to-One
                    </div>
                  )}
                </div>
              </div>

              {/* Batch schedule */}
              <div className="border-t border-surface-100 pt-5">
                <p className="text-xs font-semibold text-surface-500 uppercase mb-3">Available Batches</p>
                <div className="space-y-2">
                  {course.batchSchedule.slice(0, 3).map(batch => (
                    <div key={batch.id} className="flex items-center justify-between text-xs text-surface-600 bg-surface-50 rounded-lg px-3 py-2">
                      <span>{batch.day}</span>
                      <span className="font-medium text-brand-600">{batch.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Enquiry Form */}
        <div id="enquiry-form" className="mt-16 max-w-2xl mx-auto">
          <div className="bg-surface-50 rounded-3xl p-8">
            <EnquiryForm
              preselectedCourse={course.title}
              title="Enquire About This Course"
              subtitle="Our counselor will contact you with details, batch schedules and pricing."
            />
          </div>
        </div>

        {/* Related courses */}
        {relatedCourses.length > 0 && (
          <div className="mt-16">
            <h2 className="heading-xl mb-8">Related Courses</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCourses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="cta-section-banner mt-16 p-10 rounded-3xl bg-gradient-to-r from-brand-800 to-brand-700 text-white text-center">
          <h2 className="text-2xl font-display font-extrabold text-white mb-3">Ready to Start?</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">Build practical skills and take the next step in your career with Global Minds Academy.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-white text-brand-900 hover:bg-brand-50 font-bold shadow-md" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Enroll in {course.title}
              </Button>
            </Link>
            <Link to="/courses">
              <Button className="border-2 border-white/80 text-white hover:bg-white/10 font-bold" variant="outline" size="lg">
                Browse More Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
