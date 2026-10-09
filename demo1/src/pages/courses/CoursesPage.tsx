import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid, List } from 'lucide-react';
import { CourseCard } from '../../components/courses/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { categories } from '../../data/categories';
import { cn } from '../../utils/cn';
import type { Course } from '../../types';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useCmsCollection } from '../../hooks/useCmsCollection';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';

const levels = ['Beginner', 'Intermediate', 'Advanced'];
const modes = ['Online', 'Classroom', 'Both'];
const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
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
  const visibleCategories = useCmsCollection('categories', categories);
  usePageMeta({
    title: 'All Courses — IT Training, Cloud, DevOps, AI & More',
    description: `Browse ${visibleCourses.length} IT training courses in cloud computing, DevOps, AI, machine learning, full stack development, data science and more.`,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtered, setFiltered] = useState<Course[]>([]);

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedLevel = searchParams.get('level') || '';
  const selectedMode = searchParams.get('mode') || '';
  const sortBy = searchParams.get('sort') || 'popular';
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
        const categoryTitle = visibleCategories.find(category => category.slug === course.category)?.title || '';
        const searchableText = normalizeSearchText([
          course.slug,
          course.title,
          course.shortDescription,
          course.longDescription,
          course.category,
          categoryTitle,
          course.subCategory,
          course.instructor.name,
          ...course.instructor.expertise,
          ...course.tags,
          ...course.skills,
          ...course.tools,
        ].join(' '));
        return queryTerms.every(term => searchableText.includes(term));
      });
    }

    if (selectedCategory) result = result.filter(c => c.category === selectedCategory);
    if (selectedLevel) result = result.filter(c => c.level === selectedLevel);
    if (selectedMode) {
      if (selectedMode === 'Online') result = result.filter(c => c.onlineAvailable);
      if (selectedMode === 'Classroom') result = result.filter(c => c.classroomAvailable);
      if (selectedMode === 'Both') result = result.filter(c => c.onlineAvailable && c.classroomAvailable);
    }

    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.learnerCount - a.learnerCount); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'price-asc': result.sort((a, b) => a.discountPrice - b.discountPrice); break;
      case 'price-desc': result.sort((a, b) => b.discountPrice - a.discountPrice); break;
    }

    setFiltered(result);
  }, [localSearch, selectedCategory, selectedLevel, selectedMode, sortBy, visibleCategories, visibleCourses]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
  };

  const activeFilters = [
    selectedCategory && visibleCategories.find(c => c.slug === selectedCategory)?.title,
    selectedLevel,
    selectedMode,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-12">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Courses' }]} className="text-white/60 mb-4" />
          <h1 className="display-md text-white mb-3">Explore All Courses</h1>
          <p className="text-white/70 max-w-xl">
            Discover {visibleCourses.length} industry-focused courses across cloud, AI, DevOps, full stack, testing and more.
          </p>
        </div>
      </div>

      <div className="container-xl py-8">
        {coursesError && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{coursesError}</p>}
        {/* Search + Sort bar */}
        <form
          role="search"
          onSubmit={event => {
            event.preventDefault();
            setParam('q', localSearch.trim());
          }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="search"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search courses, technologies, skills..."
              className="form-input pl-10 pr-4"
              aria-label="Search courses"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  setParam('q', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 rounded-md p-1"
                aria-label="Clear course search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary btn">Search courses</button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setParam('sort', e.target.value)}
            className="form-select w-auto min-w-[180px]"
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
              'sm:hidden flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-colors',
              filterOpen ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-surface-200 text-surface-700',
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>

          {/* Layout toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setLayout('grid')}
              className={cn('p-2 rounded-lg transition-colors', layout === 'grid' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-600')}
              aria-label="Grid layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayout('list')}
              className={cn('p-2 rounded-lg transition-colors', layout === 'list' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-600')}
              aria-label="List layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((filter, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium">
                {filter}
                <button onClick={() => {
                  const keys = ['category', 'level', 'mode'];
                  keys.forEach(k => {
                    const val = searchParams.get(k);
                    if (val === filter || visibleCategories.find(c => c.title === filter && c.slug === searchParams.get('category'))) setParam(k, '');
                  });
                }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="text-sm text-surface-500 hover:text-red-500 transition-colors">
              Clear all
            </button>
          </div>
        )}

        {coursesLoading
          ? <p role="status" className="py-12 text-center text-surface-500">Loading courses...</p>
          : <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              'w-64 flex-shrink-0',
              'sm:block',
              filterOpen ? 'block' : 'hidden',
            )}
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

              {/* Category filter */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {visibleCategories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setParam('category', cat.slug)}
                        className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-surface-600 group-hover:text-surface-900 transition-colors">
                        {cat.title}
                      </span>
                      <span className="text-xs text-surface-400 ml-auto">{cat.courseCount}</span>
                    </label>
                  ))}
                  {selectedCategory && (
                    <button onClick={() => setParam('category', '')} className="text-xs text-brand-600 hover:text-brand-700 mt-1">
                      Clear category
                    </button>
                  )}
                </div>
              </div>

              {/* Level filter */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">Level</h3>
                <div className="space-y-2">
                  {levels.map(level => (
                    <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="level"
                        checked={selectedLevel === level}
                        onChange={() => setParam('level', level)}
                        className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-surface-600 group-hover:text-surface-900">{level}</span>
                    </label>
                  ))}
                  {selectedLevel && (
                    <button onClick={() => setParam('level', '')} className="text-xs text-brand-600 mt-1">Clear level</button>
                  )}
                </div>
              </div>

              {/* Mode filter */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">Training Mode</h3>
                <div className="space-y-2">
                  {modes.map(mode => (
                    <label key={mode} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="mode"
                        checked={selectedMode === mode}
                        onChange={() => setParam('mode', mode)}
                        className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-surface-600 group-hover:text-surface-900">{mode}</span>
                    </label>
                  ))}
                  {selectedMode && (
                    <button onClick={() => setParam('mode', '')} className="text-xs text-brand-600 mt-1">Clear mode</button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-surface-500" aria-live="polite">
                <span className="font-semibold text-surface-900">{filtered.length}</span> courses found
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                <h3 className="font-semibold text-surface-700 mb-2">{coursesError ? 'Courses are unavailable' : 'No courses found'}</h3>
                <p className="text-surface-500 text-sm mb-4">{coursesError ? 'Please try again later.' : 'Try adjusting your filters or search query.'}</p>
                {!coursesError && <button onClick={clearAll} className="btn-primary btn-sm">Clear all filters</button>}
              </div>
            ) : layout === 'grid' ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(course => <CourseCard key={course.id} course={course} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(course => <CourseCard key={course.id} course={course} layout="list" />)}
              </div>
            )}
          </main>
          </div>}
      </div>
    </div>
  );
}
