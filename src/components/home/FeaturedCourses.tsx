import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Course } from '../../types';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';
import { formatPrice } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { SpotlightCard } from '../ui/SpotlightCard';

const homepageCourseImages: Record<string, string> = {
  'data-science': '/images/courses/data-science.jpg',
  'machine-learning': '/images/courses/machine-learning.jpg',
  'automation-testing': '/images/courses/automation-testing.jpg',
};

function getFeaturedCourses(courses: Course[]): Course[] {
  const activeCourses = courses.filter(course => course.status === 'active');
  return [
    ...activeCourses.filter(course => course.featured),
    ...activeCourses.filter(course => !course.featured),
  ].slice(0, 3);
}

export function FeaturedCourses() {
  const { courses: visibleCourses, loading, error, refresh } = useCourseCatalog();
  const displayCourses = getFeaturedCourses(visibleCourses);

  return (
    <section id="home-courses" className="section home-featured-courses" aria-label="Featured courses">
      <div className="container-xl">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600">Learn by building</p>
            <h2 className="display-md text-surface-900">
              Find your next <span className="text-gradient">big skill</span>
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-surface-500">
              Practical, mentor-led programs designed to help you move forward in technology.
            </p>
          </div>
          <Link to="/courses">
            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />} className="home-course-view-all">
              View all courses
            </Button>
          </Link>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-center">
            <p className="text-sm text-red-800">{error}</p>
            <button type="button" onClick={refresh} className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-4">
              Try loading courses again
            </button>
          </div>
        ) : loading ? (
          <p role="status" className="py-8 text-center text-surface-500">Loading courses...</p>
        ) : displayCourses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayCourses.map(course => (
              <SpotlightCard key={course.id}>
                <Link
                  to={`/courses/${course.slug}`}
                  className={cn(
                    'home-course-card group relative flex h-full flex-col overflow-hidden rounded-2xl border',
                    'transition-all duration-300 hover:-translate-y-1',
                  )}
                  aria-label={`Explore ${course.title}`}
                >
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-100">
                  <img
                    src={homepageCourseImages[course.slug] ?? course.thumbnail}
                    alt={`${course.title} course`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                    {course.category === 'machine-learning'
                      ? 'AI & ML'
                      : course.category === 'automation-testing'
                        ? 'QA & Testing'
                        : course.subCategory || course.category}
                  </p>
                  <h3 className="font-display mb-2 line-clamp-2 text-base font-bold text-surface-900 transition-colors group-hover:text-brand-700">
                    {course.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-surface-500">
                    {course.shortDescription}
                  </p>

                  {/* Price */}
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-surface-500">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {course.duration}
                    </span>
                    <div className="text-sm font-bold text-surface-900">
                      {formatPrice(course.discountPrice, course.currency)}
                    </div>
                  </div>
                </div>
                </Link>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-surface-300 bg-white px-5 py-8 text-center">
            <p className="font-semibold text-surface-800">No courses are available right now.</p>
            <p className="mt-2 text-sm text-surface-500">Browse all published programs to find the right fit.</p>
            <Link to="/courses" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
              Browse all courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
