import { Link } from 'react-router-dom';
import { Phone, Mail, Eye } from 'lucide-react';
import { locations } from '../../data/locations';
import { Badge } from '../../components/ui/Badge';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { CountUp } from '../../components/ui/CountUp';
import { ShinyText } from '../../components/ui/ShinyText';

export default function AdminLocationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">
            <ShinyText text="Locations" shinyColor="rgba(23, 108, 115, 0.9)" />
          </h1>
          <p className="text-surface-500 text-sm mt-0.5 font-medium">
            <CountUp end={locations.length} start={true} duration={1} /> centres across India
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map(loc => (
          <SpotlightCard key={loc.id}>
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden h-full flex flex-col justify-between">
              <div>
                <img src={loc.image} alt={loc.city} className="w-full h-36 object-cover" loading="lazy" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-surface-900">{loc.city}</h3>
                    <Badge variant={loc.active ? 'green' : 'gray'}>{loc.active ? 'Open' : 'Coming Soon'}</Badge>
                  </div>
                  <p className="text-xs text-surface-500 mb-3">{loc.state}, {loc.country}</p>
                  {loc.active && (
                    <div className="space-y-1.5 mb-4 text-sm font-medium">
                      <a href={`tel:${loc.phone}`} className="flex items-center gap-2 text-surface-600 hover:text-brand-600">
                        <Phone className="w-3.5 h-3.5" />{loc.phone}
                      </a>
                      <a href={`mailto:${loc.email}`} className="flex items-center gap-2 text-surface-600 hover:text-brand-600">
                        <Mail className="w-3.5 h-3.5" />{loc.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <span className="text-xs text-surface-400 font-medium">{loc.courses.length} courses</span>
                  <Link to={`/locations/${loc.slug}`} target="_blank">
                    <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold" aria-label={`View ${loc.city} page`}>
                      <Eye className="w-3.5 h-3.5" /> View Page
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}
