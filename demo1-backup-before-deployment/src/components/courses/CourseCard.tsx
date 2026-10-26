import { Link } from 'react-router-dom';
import { Clock, BarChart2, Monitor, MapPin, BadgeCheck, BookOpen } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatPrice } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { Course } from '../../types';
import { SpotlightCard } from '../ui/SpotlightCard';
import { TiltedCard } from '../ui/TiltedCard';

interface CourseCardProps {
  course: Course;
  layout?: 'grid' | 'list';
  className?: string;
}

export function CourseCard({ course, layout = 'grid', className }: CourseCardProps) {
  const discount = course.discountPercentage;

  if (layout === 'list') {
    return (
      <Link
        to={`/courses/${course.slug}`}
        className={cn(
          'flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-surface-200 bg-white',
          'hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-300',
          'group cursor-pointer',
          className,
        )}
        aria-label={`View ${course.title} course details`}
      >
        <TiltedCard className="w-full flex-shrink-0 sm:w-40">
          <img
            src={course.thumbnail}
            alt={`${course.title} course thumbnail`}
            className="h-44 w-full rounded-xl object-cover sm:h-28"
            loading="lazy"
          />
        </TiltedCard>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex gap-2 mb-1.5">
                {course.trending && <Badge variant="accent">Trending</Badge>}
                {course.featured && <Badge variant="brand">Featured</Badge>}
              </div>
              <h3 className="font-display font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {course.title}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-brand-700">{formatPrice(course.discountPrice, course.currency)}</div>
              {discount > 0 && (
                <div className="text-xs text-surface-400 line-through">{formatPrice(course.price, course.currency)}</div>
              )}
            </div>
          </div>
          <p className="text-sm text-surface-500 line-clamp-2 mb-3">{course.shortDescription}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-surface-500">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.modules.length} modules</span>
            <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" />{course.level}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <SpotlightCard>
      <Link
        to={`/courses/${course.slug}`}
        className={cn(
          'course-card block bg-white overflow-hidden group',
          className,
        )}
        aria-label={`View ${course.title} course details`}
      >
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <TiltedCard>
          <img
            src={course.thumbnail}
            alt={`${course.title} course thumbnail`}
            className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </TiltedCard>

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {course.trending && <Badge variant="accent">Trending</Badge>}
          {course.featured && !course.trending && <Badge variant="brand">Featured</Badge>}
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}

        {/* Mode badges */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {course.onlineAvailable && (
            <span className="flex items-center gap-1 text-xs bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
              <Monitor className="w-3 h-3" /> Online
            </span>
          )}
          {course.classroomAvailable && (
            <span className="flex items-center gap-1 text-xs bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
              <MapPin className="w-3 h-3" /> Chennai Classroom
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex min-h-[17rem] flex-col">
        {/* Category */}
        <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-1.5">
          {course.subCategory}
        </p>

        {/* Title */}
        <h3 className="font-display font-semibold text-surface-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2 text-base leading-snug">
          {course.title}
        </h3>

        {/* Short description */}
        <p className="text-sm text-surface-500 line-clamp-2 mb-3 leading-relaxed">
          {course.shortDescription}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-surface-400 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" />
            {course.level}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.modules.length} modules
          </span>
          <span className="flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
            Certificate
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand-700">
              {formatPrice(course.discountPrice, course.currency)}
            </span>
            {discount > 0 && (
              <span className="text-sm text-surface-400 line-through">
                {formatPrice(course.price, course.currency)}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            View Details →
          </span>
        </div>
      </div>
      </Link>
    </SpotlightCard>
  );
}
