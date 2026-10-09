import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock3, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import type { Course } from '../../types';
import { categories } from '../../data/categories';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';
import { useCmsCollection } from '../../hooks/useCmsCollection';
import { LazyImage } from '../ui/LazyImage';
import { formatPrice } from '../../utils/formatters';

const tabs = [
  { id: 'featured', label: 'Featured' },
  { id: 'trending', label: 'Trending' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'new', label: 'New Courses' },
];

function getFilteredCourses(tab: string, courses: Course[], category: string): Course[] {
  const activeCourses = category === 'all'
    ? courses
    : courses.filter(course => course.category === category);
  const rankedCourses = activeCourses
    .filter(course => course.status === 'active')
    .slice()
    .sort((first, second) => second.learnerCount - first.learnerCount);
  if (category !== 'all') {
    return rankedCourses.slice(0, 8);
  }
  const isInTab = (course: Course) => {
    switch (tab) {
      case 'featured': return course.featured;
      case 'trending': return course.trending;
      case 'popular': return course.popular;
      default: return true;
    }
  };
  const prioritized = rankedCourses.filter(isInTab);
  const remaining = rankedCourses.filter(course => !prioritized.includes(course));
  return [...prioritized, ...remaining].slice(0, 8);
}

export function FeaturedCourses() {
  const [activeTab, setActiveTab] = useState('featured');
  const [activeCategory, setActiveCategory] = useState('all');
  const { courses: visibleCourses, loading, error, refresh } = useCourseCatalog();
  const visibleCategories = useCmsCollection('categories', categories)
    .slice()
    .sort((first, second) => first.order - second.order);
  const displayCourses = getFilteredCourses(activeTab, visibleCourses, activeCategory);
  const selectedCategory = visibleCategories.find(category => category.slug === activeCategory);
  const [spotlightCourse, ...moreCourses] = displayCourses;

  return (
    <section className="section bg-surface-50" aria-label="Featured courses">
      <div className="container-xl">
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-2">
              Learn by building
            </p>
            <h2 className="display-md text-surface-900">
              Find your next <span className="text-gradient">big skill</span>
            </h2>
            <p className="mt-3 max-w-xl text-surface-500">
              Practical, mentor-led programs designed to help you move forward in technology.
            </p>
          </div>
          <Link to="/courses">
            <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore the course catalog
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-2xl border border-surface-200 bg-white p-1.5" aria-label="Filter homepage courses">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:px-5',
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-surface-700">
            <span>Filter by category</span>
            <select
              value={activeCategory}
              onChange={event => setActiveCategory(event.target.value)}
              className="form-select w-full min-w-48 max-w-xs bg-white lg:w-auto"
              aria-label="Filter homepage courses by category"
            >
              <option value="all">All categories</option>
              {visibleCategories.map(category => (
                <option key={category.slug} value={category.slug}>{category.title}</option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
            <p className="text-sm text-red-800">{error}</p>
            <button type="button" onClick={refresh} className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-4">
              Try loading courses again
            </button>
          </div>
        ) : loading ? (
          <p role="status" className="py-12 text-center text-surface-500">Loading courses...</p>
        ) : spotlightCourse ? (
          <div className="space-y-5">
            <article className="grid overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-sm lg:grid-cols-12">
              <Link
                to={`/courses/${spotlightCourse.slug}`}
                className="group relative min-h-64 overflow-hidden bg-surface-200 sm:min-h-80 lg:col-span-5"
                aria-label={`Explore ${spotlightCourse.title}`}
              >
                <LazyImage
                  src={spotlightCourse.thumbnail}
                  alt={`${spotlightCourse.title} course`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {spotlightCourse.trending ? 'Trending program' : spotlightCourse.featured ? 'Featured program' : 'Popular program'}
                </span>
              </Link>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-7 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                  {spotlightCourse.subCategory || spotlightCourse.category}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-surface-900 sm:text-3xl">
                  {spotlightCourse.title}
                </h3>
                <p className="mt-3 line-clamp-3 leading-relaxed text-surface-600">
                  {spotlightCourse.shortDescription}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-surface-500">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {spotlightCourse.duration}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {spotlightCourse.modules.length} modules
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {spotlightCourse.level}
                  </span>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-surface-100 pt-5">
                  <div>
                    <p className="text-xs text-surface-500">Course fee</p>
                    <p className="text-xl font-bold text-surface-900">
                      {formatPrice(spotlightCourse.discountPrice, spotlightCourse.currency)}
                      {spotlightCourse.discountPercentage > 0 && (
                        <span className="ml-2 text-sm font-medium text-surface-400 line-through">
                          {formatPrice(spotlightCourse.price, spotlightCourse.currency)}
                        </span>
                      )}
                    </p>
                  </div>
                  <Link
                    to={`/courses/${spotlightCourse.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    Course details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>

            {moreCourses.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {moreCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="group flex min-w-0 gap-4 rounded-2xl border border-surface-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    aria-label={`Explore ${course.title}`}
                  >
                    <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-200 sm:h-28 sm:w-36">
                      <LazyImage
                        src={course.thumbnail}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="truncate text-xs font-semibold uppercase tracking-wide text-brand-600">
                        {course.subCategory || course.category}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-display font-bold text-surface-900 group-hover:text-brand-700">
                        {course.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-surface-500">
                        <span>{course.duration}</span>
                        <span className="font-bold text-surface-800">{formatPrice(course.discountPrice, course.currency)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-surface-300 bg-white px-5 py-12 text-center">
            <p className="font-semibold text-surface-800">
              No {selectedCategory ? `${selectedCategory.title} ` : `${tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} `}courses are available right now.
            </p>
            <p className="mt-2 text-sm text-surface-500">Browse all published programs to find the right fit.</p>
            <Link to="/courses" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
              Browse all courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-surface-500">
            Looking for a different path? Explore every published course in the catalog.
          </p>
          <Link to="/courses">
            <Button size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Browse all courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
