import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid, List, BookOpen } from 'lucide-react';
import { CourseCard } from '../../components/courses/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';
import { categories } from '../../data/categories';
import { cn } from '../../utils/cn';
import type { Course } from '../../types';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';

const modes = ['Online', 'Classroom', 'Both'];
const sortOptions = [
  { value: 'title-asc', label: 'Title: A to Z' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const quickFilters = [
  { label: 'All Courses', category: '' },
  { label: 'AWS / Cloud', category: 'cloud-computing' },
  { label: 'Data Science', category: 'data-science-analytics' },
  { label: 'Machine Learning', category: 'machine-learning' },
  { label: 'Full Stack Development', category: 'full-stack-development' },
  { label: 'Cyber Security', category: 'cyber-security' },
  { label: 'Software Testing', category: 'software-testing' },
  { label: 'Automation Testing', category: 'automation-testing' },
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
  const catalogCategories = useMemo(() => categories
    .map(category => ({
      ...category,
      courseCount: visibleCourses.filter(course => course.category === category.slug).length,
    }))
    .filter(category => category.courseCount > 0), [visibleCourses]);
  usePageMeta({
    title: 'Courses',
    description: 'Browse AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing courses.',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtered, setFiltered] = useState<Course[]>([]);

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedMode = searchParams.get('mode') || '';
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
        const categoryTitle = catalogCategories.find(category => category.slug === course.category)?.title || '';
        const searchableText = normalizeSearchText([
          course.slug,
          course.title,
          course.shortDescription,
          course.longDescription,
          course.category,
          categoryTitle,
          course.subCategory,
          ...course.tags,
          ...course.skills,
          ...course.tools,
        ].join(' '));
        return queryTerms.every(term => searchableText.includes(term));
      });
    }

    if (selectedCategory) result = result.filter(c => c.category === selectedCategory);
    if (selectedMode) {
      if (selectedMode === 'Online') result = result.filter(c => c.onlineAvailable);
      if (selectedMode === 'Classroom') result = result.filter(c => c.classroomAvailable);
      if (selectedMode === 'Both') result = result.filter(c => c.onlineAvailable && c.classroomAvailable);
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.discountPrice - b.discountPrice); break;
      case 'price-desc': result.sort((a, b) => b.discountPrice - a.discountPrice); break;
      default: result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    setFiltered(result);
  }, [localSearch, selectedCategory, selectedMode, sortBy, catalogCategories, visibleCourses]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };


  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
    setFilterOpen(false);
  };

  const activeFilters: { label: string; clear: () => void }[] = [
    selectedCategory
      ? {
          label: catalogCategories.find(c => c.slug === selectedCategory)?.title ?? selectedCategory,
          clear: () => setParam('category', ''),
        }
      : null,

    selectedMode ? { label: selectedMode, clear: () => setParam('mode', '') } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

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
            Discover {visibleCourses.length} industry-focused courses: AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing.
          </p>
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
            setParam('q', localSearch.trim());
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

            {/* Filter toggle (mobile) */}
            <button
              type="button"
              onClick={() => setFilterOpen(prev => !prev)}
              className={cn(
                'sm:hidden flex items-center gap-2 px-4 py-3 rounded-full border font-semibold text-sm transition-colors',
                filterOpen ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-surface-200 text-surface-800',
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>

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

        {/* ── Quick filter chips ── */}
        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Quick category filters">
          {quickFilters.map(qf => (
            <button
              key={qf.category}
              type="button"
              onClick={() => setParam('category', qf.category)}
              className={cn(
                'rounded-full px-4 py-2 text-sm transition-all',
                selectedCategory === qf.category
                  ? 'bg-brand-700 text-white border-brand-700 font-bold shadow-sm'
                  : 'bg-white text-surface-700 border-surface-200 hover:border-brand-500 hover:text-brand-800 font-medium',
              )}
            >
              {qf.label}
            </button>
          ))}
        </div>

        {/* ── Active filter chips ── */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">Active:</span>
            {activeFilters.map((filter, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200 text-sm font-medium"
              >
                {filter.label}
                <button
                  type="button"
                  onClick={filter.clear}
                  aria-label={`Remove ${filter.label} filter`}
                  className="ml-0.5 hover:bg-brand-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-surface-500 hover:text-red-500 transition-colors underline"
            >
              Clear all
            </button>
          </div>
        )}

        {coursesLoading
          ? <p role="status" className="py-12 text-center text-surface-500">Loading courses...</p>
          : (
          <div className="flex gap-8">
            {/* ── Sidebar Filters ── */}
            <aside
              className="hidden sm:block w-64 flex-shrink-0"
              aria-label="Course filters"
            >
              <div className="bg-white rounded-2xl border border-surface-100 p-6 sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-surface-900">Filters</h2>
                  {activeFilters.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-medium">
                      Clear all
                    </button>
                  )}
                </div>

                {/* Showing X results */}
                <p className="text-xs text-surface-500 -mt-2">
                  Showing <span className="font-semibold text-surface-700">{filtered.length}</span> of{' '}
                  <span className="font-semibold text-surface-700">{visibleCourses.filter(c => c.status === 'active').length}</span> courses
                </p>

                {/* Category filter — pill-row radio */}
                <div>
                  <h3 className="text-sm font-semibold text-surface-700 mb-3">Category</h3>
                  <div className="space-y-1">
                    {catalogCategories.map(cat => (
                      <label
                        key={cat.id}
                        className={cn(
                          'flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg transition-colors',
                          selectedCategory === cat.slug
                            ? 'bg-brand-50 text-brand-700'
                            : 'hover:bg-surface-50 text-surface-600',
                        )}
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.slug}
                          onChange={() => setParam('category', selectedCategory === cat.slug ? '' : cat.slug)}
                          className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                        />
                        <span className="text-sm flex-1">{cat.title}</span>
                      </label>
                    ))}
                    {selectedCategory && (
                      <button
                        type="button"
                        onClick={() => setParam('category', '')}
                        className="text-xs text-brand-600 hover:text-brand-700 mt-1 px-3"
                      >
                        Clear category
                      </button>
                    )}
                  </div>
                </div>


                {/* Mode filter — pill-row radio */}
                <div>
                  <h3 className="text-sm font-semibold text-surface-700 mb-3">Training Mode</h3>
                  <div className="space-y-1">
                    {modes.map(mode => (
                      <label
                        key={mode}
                        className={cn(
                          'flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg transition-colors',
                          selectedMode === mode
                            ? 'bg-brand-50 text-brand-700'
                            : 'hover:bg-surface-50 text-surface-600',
                        )}
                      >
                        <input
                          type="radio"
                          name="mode"
                          checked={selectedMode === mode}
                          onChange={() => setParam('mode', selectedMode === mode ? '' : mode)}
                          className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                        />
                        <span className="text-sm">{mode}</span>
                      </label>
                    ))}
                    {selectedMode && (
                      <button
                        type="button"
                        onClick={() => setParam('mode', '')}
                        className="text-xs text-brand-600 mt-1 px-3"
                      >
                        Clear mode
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 min-w-0">
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
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : layout === 'grid' ? (
                /* ── Grid with fade-in animation on filter change ── */
                <div
                  key={`${filtered.length}-${selectedCategory}-${selectedMode}`}
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 opacity-100"
                >
                  {filtered.map(course => <CourseCard key={course.id} course={course} />)}
                </div>
              ) : (
                <div
                  key={`list-${filtered.length}-${selectedCategory}-${selectedMode}`}
                  className="space-y-4 transition-opacity duration-300 opacity-100"
                >
                  {filtered.map(course => <CourseCard key={course.id} course={course} layout="list" />)}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ── Mobile filter overlay (slide-in panel) ── */}
      {filterOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <aside
            className="relative ml-auto w-80 max-w-full h-full bg-white shadow-2xl overflow-y-auto"
            aria-label="Course filters"
          >
            <div className="flex items-center justify-between p-5 border-b border-surface-100">
              <h2 className="font-semibold text-surface-900">Filters</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="p-2 rounded-full hover:bg-surface-100 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5 text-surface-600" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Showing X results */}
              <p className="text-xs text-surface-500">
                Showing <span className="font-semibold text-surface-700">{filtered.length}</span> of{' '}
                <span className="font-semibold text-surface-700">
                  {visibleCourses.filter(c => c.status === 'active').length}
                </span> courses
              </p>

              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">Category</h3>
                <div className="space-y-1">
                  {catalogCategories.map(cat => (
                    <label
                      key={cat.id}
                      className={cn(
                        'flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg transition-colors',
                        selectedCategory === cat.slug ? 'bg-brand-50 text-brand-700' : 'hover:bg-surface-50 text-surface-600',
                      )}
                    >
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setParam('category', selectedCategory === cat.slug ? '' : cat.slug)}
                        className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                      />
                      <span className="text-sm flex-1">{cat.title}</span>
                    </label>
                  ))}
                </div>
              </div>


              {/* Mode */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">Training Mode</h3>
                <div className="space-y-1">
                  {modes.map(mode => (
                    <label
                      key={mode}
                      className={cn(
                        'flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg transition-colors',
                        selectedMode === mode ? 'bg-brand-50 text-brand-700' : 'hover:bg-surface-50 text-surface-600',
                      )}
                    >
                      <input
                        type="radio"
                        name="mode-mobile"
                        checked={selectedMode === mode}
                        onChange={() => setParam('mode', selectedMode === mode ? '' : mode)}
                        className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                      />
                      <span className="text-sm">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear all */}
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="w-full btn border border-red-200 text-red-600 hover:bg-red-50 rounded-full"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
