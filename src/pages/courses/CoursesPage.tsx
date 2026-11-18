import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Grid, List, BookOpen } from 'lucide-react';
import { CourseCard } from '../../components/courses/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';
import { cn } from '../../utils/cn';
import type { Course } from '../../types';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';
import { DateCycleBadge } from '../../components/common/DateCycleBadge';

const sortOptions = [
  { value: 'title-asc', label: 'Title: A to Z' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function CoursesPage() {
  const { courses: visibleCourses, loading: coursesLoading, error: coursesError } = useCourseCatalog();
  usePageMeta({
    title: 'Courses',
    description: 'Browse AWS / Cloud, Data Analytics, Python, Gen AI / Agent AI, AIDS, AIML, Digital Marketing, Full Stack Development, Cyber Security, Software Testing, and Automation Testing courses.',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filtered, setFiltered] = useState<Course[]>([]);

  const searchQuery = searchParams.get('q') || '';
  const sortBy = sortOptions.find(option => option.value === searchParams.get('sort'))?.value ?? 'title-asc';
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Apply filters
  useEffect(() => {
    let result = visibleCourses.filter(c => c.status === 'active');

    const queryTerms = normalizeSearchText(localSearch).split(' ').filter(Boolean);
    if (queryTerms.length > 0) {
      result = result.filter(course => {
        const searchableText = normalizeSearchText([
          course.slug,
          course.title,
          course.shortDescription,
          course.longDescription,
          course.category,
          course.subCategory,
          ...course.tags,
          ...course.skills,
          ...course.tools,
        ].join(' '));
        return queryTerms.every(term => searchableText.includes(term));
      });
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.discountPrice - b.discountPrice); break;
      case 'price-desc': result.sort((a, b) => b.discountPrice - a.discountPrice); break;
      default: result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    setFiltered(result);
  }, [localSearch, sortBy, visibleCourses]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };


  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="page-hero-premium py-14">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Courses' }]} className="mb-4" />
          <div className="page-hero-badge mb-3">
            <ShinyText text="✨ Career-Focused Curricula" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title display-md font-extrabold mb-3">
            Explore <DecryptedText text="All Courses" speed={30} maxIterations={10} className="page-hero-highlight" />
          </h1>
          <p className="page-hero-desc max-w-2xl text-base sm:text-lg">
            Discover {visibleCourses.length} industry-focused courses: AWS / Cloud, Data Analytics, Python, Gen AI / Agent AI, AIDS, AIML, Digital Marketing, Full Stack Development, Cyber Security, Software Testing, and Automation Testing.
          </p>
          <div className="mt-4">
            <DateCycleBadge variant="compact" />
          </div>
        </div>
      </div>

      <div className="container-xl py-8">
        {coursesError && (
          <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {coursesError}
          </p>
        )}

        {/* ── Prominent search bar ── */}
        <form
          role="search"
          onSubmit={event => {
            event.preventDefault();
            const query = localSearch.trim();
            navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
          }}
          className="mb-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search input — large pill */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
              <input
                type="search"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search courses, technologies, skills..."
                className="w-full pl-12 pr-12 py-3.5 rounded-full border border-surface-200 bg-white shadow-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow"
                aria-label="Search courses"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setParam('q', '');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 rounded-full p-1 transition-colors"
                  aria-label="Clear course search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button type="submit" className="btn-primary btn rounded-full px-6">
              Search
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setParam('sort', e.target.value)}
              className="form-select w-auto min-w-[180px] rounded-full"
              aria-label="Sort courses"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Layout toggle — polished pill */}
            <div className="hidden sm:flex items-center bg-surface-100 rounded-full p-1 border border-surface-200">
              <button
                type="button"
                onClick={() => setLayout('grid')}
                className={cn(
                  'p-2 rounded-full transition-all',
                  layout === 'grid' ? 'bg-white shadow-sm text-brand-700 font-bold' : 'text-surface-500 hover:text-surface-800',
                )}
                aria-label="Grid layout"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayout('list')}
                className={cn(
                  'p-2 rounded-full transition-all',
                  layout === 'list' ? 'bg-white shadow-sm text-brand-700 font-bold' : 'text-surface-500 hover:text-surface-800',
                )}
                aria-label="List layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {coursesLoading
          ? <p role="status" className="py-12 text-center text-surface-500">Loading courses...</p>
          : (
            <main className="min-w-0">
              {/* Results count + sort — inline row */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-surface-500" aria-live="polite">
                  Showing{' '}
                  <span className="font-semibold text-surface-900">{filtered.length}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-surface-900">
                    {visibleCourses.filter(c => c.status === 'active').length}
                  </span>
                  {' '}courses
                </p>
              </div>

              {filtered.length === 0 ? (
                /* ── Card-style empty state ── */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
                    <BookOpen className="w-10 h-10 text-brand-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-surface-800 mb-2">
                    {coursesError ? 'Courses unavailable' : 'No courses found'}
                  </h3>
                  <p className="text-surface-500 text-sm max-w-sm mb-6">
                    {coursesError
                      ? 'We could not load courses right now. Please try again later.'
                      : 'No courses match your current filters or search. Try broadening your search or clearing filters.'}
                  </p>
                  {!coursesError && (
                    <button onClick={clearAll} className="btn-primary btn-sm rounded-full px-6">
                      Clear search
                    </button>
                  )}
                </div>
              ) : layout === 'grid' ? (
                /* ── Grid with fade-in animation on filter change ── */
                <div
                  key={filtered.length}
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 opacity-100"
                >
                  {filtered.map(course => <CourseCard key={course.id} course={course} />)}
                </div>
              ) : (
                <div
                  key={`list-${filtered.length}`}
                  className="space-y-4 transition-opacity duration-300 opacity-100"
                >
                  {filtered.map(course => <CourseCard key={course.id} course={course} layout="list" />)}
                </div>
              )}
            </main>
        )}
      </div>
    </div>
  );
}
