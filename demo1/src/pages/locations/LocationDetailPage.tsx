import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Monitor, ArrowRight, CheckCircle } from 'lucide-react';
import { locations } from '../../data/locations';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Badge } from '../../components/ui/Badge';
import NotFoundPage from '../NotFoundPage';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function LocationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const visibleLocations = useCmsCollection('locations', locations)
    .filter(item => item.slug === 'chennai');
  const location = visibleLocations.find(item => item.slug === (slug || ''));

  usePageMeta({
    title: location ? `${location.city} Training Centre` : undefined,
    description: location
      ? `Global Minds Academy ${location.city} classroom training centre.`
      : undefined,
  });

  if (!location) return <NotFoundPage />;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-14">
        <div className="container-xl">
          <Breadcrumbs
            items={[
              { label: 'Locations', href: '/locations' },
              { label: location.city },
            ]}
            className="text-white/50 mb-4"
          />
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant={location.active ? 'green' : 'gray'}>
              {location.active ? 'Open' : 'Coming Soon'}
            </Badge>
          </div>
          <h1 className="display-md text-white mb-2">Global Minds Academy {location.city}</h1>
          <p className="text-white/70 text-lg">{location.state}, {location.country}</p>
        </div>
      </div>

      <div className="container-xl py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Photo */}
            <img
              src={location.image}
              alt={`Global Minds Academy ${location.city} training centre`}
              className="w-full h-72 object-cover rounded-3xl"
              loading="eager"
            />

            {/* Contact info */}
            <section aria-labelledby="contact-h">
              <h2 id="contact-h" className="heading-xl mb-5">Contact & Location</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: MapPin, label: 'Address', value: location.address },
                  { icon: Phone, label: 'Phone', value: location.phone, href: `tel:${location.phone}` },
                  { icon: Mail, label: 'Email', value: location.email, href: `mailto:${location.email}` },
                  { icon: Clock, label: 'Hours', value: 'Mon – Sat: 9 AM – 7 PM' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 font-medium mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-surface-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Facilities */}
            <section aria-labelledby="facilities-h">
              <h2 id="facilities-h" className="heading-xl mb-4">Facilities</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {location.facilities.map(f => (
                  <div key={f} className="flex items-center gap-2.5 p-3 bg-surface-50 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-surface-700">{f}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Online option */}
            <div className="flex items-start gap-4 p-6 bg-brand-50 rounded-2xl border border-brand-100">
              <Monitor className="w-8 h-8 text-brand-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-brand-900 mb-1">Can't visit in person?</h3>
                <p className="text-brand-700 text-sm mb-3">
                  All our courses are also available online. Live instructor-led sessions accessible from anywhere in the world.
                </p>
                <Link to="/online-training">
                  <button className="btn-primary btn text-sm flex items-center gap-2">
                    Online Training <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Enquiry */}
            <div className="bg-surface-50 rounded-3xl p-8">
              <EnquiryForm title={`Enquire — ${location.city} Centre`} subtitle="Get details on batch schedules, available courses and admission." />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-surface-100 rounded-2xl p-6 shadow-card">
              <h3 className="font-semibold text-surface-900 mb-4">Courses Available Here</h3>
              {publicCourseCatalog.some(course => location.courses.includes(course.sourceSlug)) ? (
                <ul className="space-y-2">
                  {publicCourseCatalog.filter(course => location.courses.includes(course.sourceSlug)).map(course => (
                    <li key={course.sourceSlug}>
                      <Link
                        to={`/courses/${course.sourceSlug}`}
                        className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                        {course.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-surface-500">Contact us for available courses at this centre.</p>
              )}
              <Link to="/courses" className="block mt-4">
                <button className="btn-secondary btn w-full text-sm">All Courses</button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
