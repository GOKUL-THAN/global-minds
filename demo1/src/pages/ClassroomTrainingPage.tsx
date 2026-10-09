import { MapPin, Monitor, Users, Laptop, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { locations } from '../data/locations';
import { useCmsCollection } from '../hooks/useCmsCollection';

export default function ClassroomTrainingPage() {
  const active = useCmsCollection('locations', locations).filter(location => location.active);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Classroom Training' }]} className="text-white/50 mb-4" />
          <h1 className="display-lg text-white mb-4">Classroom Training</h1>
          <p className="text-white/80 text-xl max-w-2xl">
            Immersive, hands-on classroom training at our dedicated learning centres with expert instructors and fully equipped labs.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-md mb-4">Our Training Centres</h2>
            <p className="text-surface-500">Placeholder locations — contact us to confirm availability and addresses.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {active.map(loc => (
              <Link key={loc.id} to={`/locations/${loc.slug}`} className="card-hover overflow-hidden block">
                <img src={loc.image} alt={loc.city} className="w-full h-44 object-cover" loading="lazy" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-surface-900">{loc.city}, {loc.state}</span>
                  </div>
                  <p className="text-xs text-surface-500 mb-3">{loc.address}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {loc.facilities.slice(0, 3).map(f => (
                      <span key={f} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-lg">{f}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <h2 className="display-md text-center mb-12">Classroom Facilities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Laptop, title: 'Computer Labs', desc: 'Fully equipped labs with the latest hardware and software.' },
              { icon: Monitor, title: 'Smart Classrooms', desc: 'Air-conditioned smart classrooms with HD projectors.' },
              { icon: Users, title: 'Small Batches', desc: 'Limited batch sizes for personalised attention.' },
              { icon: Coffee, title: 'Student Lounge', desc: 'Comfortable break areas and cafeteria facilities.' },
            ].map(f => (
              <div key={f.title} className="text-center p-6 bg-white rounded-2xl border border-surface-100">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">{f.title}</h3>
                <p className="text-surface-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Visit Our Training Centre"
        subtitle="Contact us to schedule a campus visit or enquire about the next classroom batch."
        primaryLabel="Enquire Now"
        primaryHref="/contact"
        secondaryLabel="View Locations"
        secondaryHref="/locations"
      />
    </div>
  );
}
