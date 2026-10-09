import { useParams, Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { CourseCard } from '../components/courses/CourseCard';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import NotFoundPage from './NotFoundPage';
import { useCmsCollection } from '../hooks/useCmsCollection';
import { useCourseCatalog } from '../hooks/useCourseCatalog';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const visibleCategories = useCmsCollection('categories', categories);
  const { courses: visibleCourses, loading: coursesLoading, error: coursesError } = useCourseCatalog();
  const category = visibleCategories.find(item => item.slug === (slug || ''));
  const catCourses = visibleCourses.filter(course => course.category === (slug || '') && course.status === 'active');

  if (!category) return <NotFoundPage />;

  return (
    <div className="min-h-screen bg-white">
      <div
        className="py-14 text-white"
        style={{ background: `linear-gradient(135deg, ${category.color}dd, ${category.color}99)` }}
      >
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Courses', href: '/courses' }, { label: category.title }]} className="text-white/60 mb-4" />
          <h1 className="display-md text-white mb-3">{category.title}</h1>
          <p className="text-white/80 max-w-xl">{category.description}</p>
        </div>
      </div>
      <div className="container-xl py-12">
        {coursesError && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{coursesError}</p>}
        <div className="flex items-center justify-between mb-8">
          <h2 className="heading-xl">
            {coursesLoading ? 'Loading Courses...' : catCourses.length > 0 ? `${catCourses.length} Courses Available` : coursesError ? 'Courses Unavailable' : 'Courses Coming Soon'}
          </h2>
        </div>
        {catCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {catCourses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : coursesLoading ? (
          <p role="status" className="py-16 text-center text-surface-500">Loading courses...</p>
        ) : coursesError ? null : (
          <div className="text-center py-16 bg-surface-50 rounded-3xl">
            <p className="text-surface-500 mb-4">
              Courses for <strong>{category.title}</strong> are coming soon.
            </p>
            <Link to="/courses" className="btn-primary btn inline-flex">Browse All Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
