import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Phone, Mail, Monitor, ChevronDown } from 'lucide-react';
import { locations } from '../../data/locations';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CTASection } from '../../components/home/CTASection';
import { Badge } from '../../components/ui/Badge';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function LocationsPage() {
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());
  const visibleLocations = useCmsCollection('locations', locations)
    .filter(location => location.slug === 'chennai');

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Locations' }]} className="text-white/50 mb-4" />
          <h1 className="display-lg text-white mb-4">Training Centres</h1>
          <p className="text-white/70">In-person classroom training is available in Chennai. Online training is available globally.</p>
          <p className="text-white/40 text-sm mt-2">Contact us to confirm the Chennai centre address.</p>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <h2 className="heading-xl mb-8">Chennai Centre</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleLocations.map(loc => (
              <div key={loc.id} className={`card-hover overflow-hidden ${!loc.active ? 'opacity-60' : ''}`}>
                <img src={loc.image} alt={loc.city} className="w-full h-44 object-cover" loading="lazy" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-surface-900 text-lg">{loc.city}</h3>
                    <Badge variant={loc.active ? 'green' : 'gray'}>{loc.active ? 'Open' : 'Coming Soon'}</Badge>
                  </div>
                  <p className="text-surface-400 text-xs mb-3">{loc.state}, {loc.country}</p>
                  {loc.active && (
                    <div className="space-y-2 mb-4">
                      <a href={`tel:${loc.phone}`} className="flex items-center gap-2 text-sm text-surface-600 hover:text-brand-600">
                        <Phone className="w-3.5 h-3.5" />{loc.phone}
                      </a>
                      <a href={`mailto:${loc.email}`} className="flex items-center gap-2 text-sm text-surface-600 hover:text-brand-600">
                        <Mail className="w-3.5 h-3.5" />{loc.email}
                      </a>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {(expandedLocations.has(loc.id) ? loc.facilities : loc.facilities.slice(0, 3)).map(f => (
                      <span key={f} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-lg">{f}</span>
                    ))}
                  </div>
                  {(loc.facilities.length > 3 || loc.courses.length > 0) && (
                    <button
                      type="button"
                      aria-expanded={expandedLocations.has(loc.id)}
                      aria-controls={`location-details-${loc.id}`}
                      onClick={() => setExpandedLocations(current => {
                        const next = new Set(current);
                        if (next.has(loc.id)) next.delete(loc.id);
                        else next.add(loc.id);
                        return next;
                      })}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                    >
                      {expandedLocations.has(loc.id) ? 'Show less' : 'Show centre details'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedLocations.has(loc.id) ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                  <div id={`location-details-${loc.id}`} hidden={!expandedLocations.has(loc.id)} className="mt-4 border-t border-surface-100 pt-4">
                    <p className="text-xs font-semibold text-surface-500 mb-1">Courses available at this centre</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {publicCourseCatalog.filter(course => loc.courses.includes(course.sourceSlug)).map(course => (
                        <li key={course.sourceSlug} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-lg">
                          {course.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Online note */}
          <div className="mt-12 p-8 rounded-3xl bg-brand-50 border border-brand-100 flex items-start gap-4">
            <Monitor className="w-8 h-8 text-brand-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-brand-900 mb-1">Available Worldwide — Online</h3>
              <p className="text-brand-700 text-sm">Can't attend in person? Our online training is available globally — India, UAE, UK, USA, Canada, Australia, Singapore and more.</p>
              <Link to="/online-training" className="text-sm font-semibold text-brand-600 hover:text-brand-700 mt-2 inline-block">Learn about online training →</Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Visit Our Chennai Centre"
        subtitle="Visit our Chennai centre and speak with our career counselors in person."
        primaryLabel="Enquire Now"
        primaryHref="/contact"
      />
    </div>
  );
}
