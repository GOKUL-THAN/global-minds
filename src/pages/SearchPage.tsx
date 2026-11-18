import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { useCourseCatalog } from '../hooks/useCourseCatalog';
import { usePageMeta } from '../hooks/usePageMeta';

const searchablePages = [
  { title: 'Home', description: 'Explore Global Minds Technologies training, programs, projects, and career support.', href: '/', terms: 'technologies training skills learn' },
  { title: 'Courses', description: 'Browse career-focused courses, technologies, and skills.', href: '/courses', terms: 'course training curriculum technology skills' },
  { title: 'Master Programs', description: 'Explore comprehensive master programs and learning paths.', href: '/master-programs', terms: 'master program advanced learning' },
  { title: 'Placement Records', description: 'View placement support, outcomes, and learner records.', href: '/placement-records', terms: 'placement records jobs career outcomes' },
  { title: 'Live Projects', description: 'Explore practical projects based on real industry scenarios.', href: '/projects', terms: 'live industry projects portfolio practice' },
  { title: 'Internships', description: 'Explore internship opportunities and practical experience.', href: '/internships', terms: 'internship opportunities experience' },
  { title: 'Online Training', description: 'Learn remotely with flexible online training programs.', href: '/online-training', terms: 'online remote virtual training' },
  { title: 'Classroom Training', description: 'Explore classroom training options.', href: '/classroom-training', terms: 'classroom in-person training' },
  { title: 'Corporate Training', description: 'Training programs for teams and organizations.', href: '/corporate-training', terms: 'corporate business teams organization' },
  { title: 'College Programs', description: 'Explore training and learning programs for colleges.', href: '/colleges', terms: 'college campus students' },
  { title: 'About Us', description: 'Learn about Global Minds Technologies and our approach to education.', href: '/about', terms: 'about technologies company' },
  { title: 'Contact Us', description: 'Contact the admissions team for help choosing a course.', href: '/contact', terms: 'contact admissions support help' },
  { title: 'Blog', description: 'Read learning resources, insights, and company updates.', href: '/blog', terms: 'blog articles resources updates' },
  { title: 'Refund Policy', description: 'Read the refund policy and information about refunds.', href: '/refund-policy', terms: 'refund refunds cancellation policy' },
  { title: 'Privacy Policy', description: 'Learn how personal information is handled.', href: '/privacy-policy', terms: 'privacy personal information data' },
  { title: 'Terms and Conditions', description: 'Read the terms and conditions for using the website.', href: '/terms', terms: 'terms conditions agreement' },
];

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function SearchPage() {
  const { courses, loading, error } = useCourseCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(query);
  const queryTerms = useMemo(() => normalizeSearchText(query).split(' ').filter(Boolean), [query]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  usePageMeta({
    title: query ? `Search: ${query}` : 'Search the Website',
    description: 'Search courses, programs, projects, and resources at Global Minds Technologies.',
  });

  const matchingPages = useMemo(() => searchablePages.filter(page => {
    const text = normalizeSearchText(`${page.title} ${page.description} ${page.terms}`);
    return queryTerms.length > 0 && queryTerms.every(term => text.includes(term));
  }), [queryTerms]);

  const matchingCourses = useMemo(() => courses.filter(course => {
    if (course.status !== 'active' || queryTerms.length === 0) return false;
    const text = normalizeSearchText([
      course.slug,
      course.title,
      course.shortDescription,
      course.longDescription,
      course.category,
      course.subCategory,
      ...course.tags,
      ...course.skills,
      ...course.tools,
      ...course.syllabus,
      ...course.modules.flatMap(module => [module.title, ...module.topics]),
    ].join(' '));
    return queryTerms.every(term => text.includes(term));
  }), [courses, queryTerms]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    const value = searchInput.trim();
    if (value) next.set('q', value);
    else next.delete('q');
    setSearchParams(next);
  };

  const hasQuery = queryTerms.length > 0;
  const resultCount = matchingPages.length + matchingCourses.length;

  return (
    <div className="min-h-screen bg-surface-50">
      <section className="page-hero-premium py-14">
        <div className="container-xl relative z-10">
          <p className="mb-3 text-sm font-semibold text-brand-700">Global Minds Technologies</p>
          <h1 className="page-hero-title display-md mb-3 font-extrabold">Search the Website</h1>
          <p className="page-hero-desc max-w-2xl text-base sm:text-lg">
            Find courses, programs, projects, and resources.
          </p>
          <form role="search" onSubmit={submitSearch} className="mt-7 flex max-w-4xl flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search the website</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
              <input
                type="search"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="Search courses, programs, projects..."
                className="w-full rounded-full border border-surface-200 bg-white py-3.5 pl-12 pr-4 text-surface-900 shadow-sm placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <button type="submit" className="btn-primary btn rounded-full px-7">Search</button>
          </form>
        </div>
      </section>

      <section className="container-xl py-10" aria-live="polite">
        {error && (
          <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Course results could not be loaded: {error}
          </p>
        )}

        {!hasQuery ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-brand-600" aria-hidden="true" />
            <h2 className="text-xl font-bold text-surface-900">What are you looking for?</h2>
            <p className="mt-2 text-surface-600">Search for a course, technology, program, or topic.</p>
            <Link to="/courses" className="btn-primary btn mt-5 rounded-full">Browse all courses</Link>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-lg font-semibold text-surface-800">
              {loading ? 'Searching...' : `${resultCount} ${resultCount === 1 ? 'result' : 'results'} for “${query}”`}
            </h2>

            {loading ? (
              <p role="status" className="py-10 text-center text-surface-500">Loading search results...</p>
            ) : resultCount === 0 ? (
              <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center">
                <h3 className="text-xl font-bold text-surface-900">No results found</h3>
                <p className="mt-2 text-surface-600">Try another keyword or browse all courses.</p>
                <Link to="/courses" className="btn-primary btn mt-5 rounded-full">Browse all courses</Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matchingPages.map(page => (
                  <Link
                    key={page.href}
                    to={page.href}
                    className="group rounded-2xl border border-surface-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-brand-700">Website page</span>
                    <h3 className="mt-2 flex items-center justify-between gap-3 font-display text-lg font-bold text-surface-900 group-hover:text-brand-700">
                      {page.title}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-surface-600">{page.description}</p>
                  </Link>
                ))}
                {matchingCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="group rounded-2xl border border-surface-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-brand-700">Course</span>
                    <h3 className="mt-2 flex items-center justify-between gap-3 font-display text-lg font-bold text-surface-900 group-hover:text-brand-700">
                      {course.title}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-surface-600">{course.shortDescription}</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}