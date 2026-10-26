import { Link } from 'react-router-dom';
import { Phone, Mail, Eye } from 'lucide-react';
import { locations as staticLocations } from '../../data/locations';
import { Badge } from '../../components/ui/Badge';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function AdminLocationsPage() {
  const locations = useCmsCollection('locations', staticLocations);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Locations</h1>
          <p className="text-surface-500 text-sm mt-0.5">{locations.length} locations (placeholder data)</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
            <img src={loc.image} alt={loc.city} className="w-full h-36 object-cover" loading="lazy" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-surface-900">{loc.city}</h3>
                <Badge variant={loc.active ? 'green' : 'gray'}>{loc.active ? 'Open' : 'Coming Soon'}</Badge>
              </div>
              <p className="text-xs text-surface-500 mb-3">{loc.state}, {loc.country}</p>
              {loc.active && (
                <div className="space-y-1.5 mb-4 text-sm">
                  <a href={`tel:${loc.phone}`} className="flex items-center gap-2 text-surface-600 hover:text-brand-600">
                    <Phone className="w-3.5 h-3.5" />{loc.phone}
                  </a>
                  <a href={`mailto:${loc.email}`} className="flex items-center gap-2 text-surface-600 hover:text-brand-600">
                    <Mail className="w-3.5 h-3.5" />{loc.email}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-400">{loc.courses.length} courses</span>
                <Link to={`/locations/${loc.slug}`} target="_blank">
                  <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium">
                    <Eye className="w-3.5 h-3.5" /> View Page
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
