import { useState } from 'react';
import { Calendar, Clock, Monitor, MapPin, Users, ExternalLink, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCmsCollection } from '../hooks/useCmsCollection';
import { siteConfig } from '../data/siteConfig';
import { ShinyText } from '../components/ui/ShinyText';
import { DecryptedText } from '../components/ui/DecryptedText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { dateService, useDateSystem } from '../services/dateService';
import { DateCycleBadge } from '../components/common/DateCycleBadge';

type EventType = 'All' | 'Webinar' | 'Workshop' | 'Hackathon' | 'Seminar';

interface Event {
  id: string;
  title: string;
  type: 'Webinar' | 'Workshop' | 'Hackathon' | 'Seminar';
  date: string;
  time: string;
  duration: string;
  speaker: string;
  speakerRole: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  seats: number;
  seatsLeft: number;
  fee: string;
  description: string;
  topics: string[];
  badge?: string;
}

function typeBadgeColor(type: Event['type']) {
  switch (type) {
    case 'Webinar': return 'bg-brand-100 text-brand-700';
    case 'Workshop': return 'bg-orange-100 text-orange-700';
    case 'Hackathon': return 'bg-purple-100 text-purple-700';
    case 'Seminar': return 'bg-green-100 text-green-700';
  }
}

function feeBadge(fee: string) {
  return fee === 'Free'
    ? <span className="text-green-700 font-bold text-sm">Free</span>
    : <span className="text-surface-900 font-bold text-sm">{fee}</span>;
}

interface RegisterForm { name: string; email: string; phone: string }

export default function EventsPage() {
  const { todayString } = useDateSystem();
  const events = useCmsCollection<Event>('events');

  usePageMeta({
    title: 'Events, Webinars & Workshops',
    description: 'Attend free and paid webinars, workshops, hackathons and seminars at Global Minds Technologies. Build skills, network with experts and accelerate your career.',
  });

  const [filter, setFilter] = useState<EventType>('All');
  const [registering, setRegistering] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [regForm, setRegForm] = useState<RegisterForm>({ name: '', email: '', phone: '' });

  const filtered = events
    .filter(event => /^\d{4}-\d{2}-\d{2}$/.test(event.date) && event.date >= todayString)
    .filter(event => filter === 'All' || event.type === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!registering) return;

    const event = events.find(item => item.id === registering);
    if (!event) return;

    const subject = `Event registration request: ${event.title}`;
    const body = [
      `Event: ${event.title}`,
      `Name: ${regForm.name}`,
      `Email: ${regForm.email}`,
      `Phone: ${regForm.phone}`,
    ].join('\n');

    window.location.href = `mailto:${siteConfig.admissionsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setRegistering(null);
    setRegForm({ name: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-16 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Events & Webinars' }]} className="mb-4" />
          <div className="page-hero-badge mb-4">
            <ShinyText text="Live Community Sessions & Masterclasses" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title mb-4">
            Events, Webinars &amp; <DecryptedText text="Workshops" speed={30} maxIterations={10} className="page-hero-highlight" />
          </h1>
          <p className="page-hero-desc text-xl max-w-2xl leading-relaxed">
            Learn from industry experts, build skills through hands-on workshops, and connect with the tech community — most events are free.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="page-hero-chip">Live Interactive Q&amp;A</div>
            <div className="page-hero-chip">Certificate of Attendance</div>
            <div className="page-hero-chip">Industry Mentors</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-surface-100 shadow-sm">
        <div className="container-xl">
          <div className="flex overflow-x-auto py-3 gap-2 no-scrollbar">
            {(['All', 'Webinar', 'Workshop', 'Hackathon', 'Seminar'] as EventType[]).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${filter === t ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-surface-700 border border-surface-200 hover:border-brand-500 hover:text-brand-800'
                  }`}
              >
                {t}
              </button>
            ))}
            <span className="ml-auto text-sm text-surface-700 font-semibold self-center whitespace-nowrap flex-shrink-0">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <DateCycleBadge variant="banner" className="mb-8" />
          {filtered.length ? <div className="grid md:grid-cols-2 gap-6">
            {filtered.map(event => {
              const isExpanded = expandedEvents.has(event.id);
              return (
                <SpotlightCard key={event.id} className="h-full">
                  <article
                    className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-card-lg transition-shadow h-full flex flex-col justify-between"
                  >
                  {/* Top accent bar by type */}
                  <div className={`h-1 w-full ${event.type === 'Webinar' ? 'bg-brand-500' :
                    event.type === 'Workshop' ? 'bg-orange-400' :
                      event.type === 'Hackathon' ? 'bg-purple-500' : 'bg-green-500'
                    }`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${typeBadgeColor(event.type)}`}>{event.type}</span>
                          {event.badge && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-red-100 text-red-700">{event.badge}</span>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-surface-900 leading-snug">{event.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-surface-600 font-medium mb-4 leading-relaxed">{event.description}</p>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-surface-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        {dateService.formatDate(event.date, 'long')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-surface-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-surface-700 font-medium">
                        {event.mode === 'Offline'
                          ? <MapPin className="w-3.5 h-3.5 text-brand-600" />
                          : <Monitor className="w-3.5 h-3.5 text-brand-600" />
                        }
                        {event.mode}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-surface-700 font-medium">
                        <Users className="w-3.5 h-3.5 text-brand-600" />
                        <span className={event.seatsLeft <= 20 ? 'text-red-700 font-bold' : ''}>
                          {event.seatsLeft} seats left
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`event-details-${event.id}`}
                      onClick={e => {
                        e.stopPropagation();
                        setExpandedEvents(current => {
                          const next = new Set(current);
                          if (next.has(event.id)) next.delete(event.id);
                          else next.add(event.id);
                          return next;
                        });
                      }}
                      className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                    >
                      {isExpanded ? 'Show less' : 'More event details'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <div id={`event-details-${event.id}`} hidden={!isExpanded} className="mb-4 rounded-xl bg-brand-50 border border-brand-200 p-4 text-sm text-surface-800 font-medium">
                      <p><span className="font-bold">Duration:</span> {event.duration}</p>
                      <p className="mt-1"><span className="font-bold">Capacity:</span> {event.seats} attendees ({event.seatsLeft} seats remaining)</p>
                    </div>

                    {/* Speaker */}
                    <div className="flex items-center gap-3 p-3 bg-surface-50 border border-surface-200 rounded-xl mb-4">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {event.speaker.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-surface-900">{event.speaker}</p>
                        <p className="text-xs text-surface-600 font-medium">{event.speakerRole}</p>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {event.topics.map(t => (
                        <span key={t} className="text-xs bg-surface-100 text-surface-700 font-medium px-2 py-0.5 rounded-full border border-surface-200">{t}</span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                      <div>{feeBadge(event.fee)}</div>
                      <button
                        type="button"
                        onClick={() => setRegistering(event.id)}
                        className="inline-flex items-center rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        Register Now
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </button>
                    </div>
                  </div>
                </article>
              </SpotlightCard>
            );
          })}
          </div> : <p className="text-center text-surface-600">No upcoming events have been published yet.</p>}
        </div>
      </section>

      {/* Host an event CTA */}
      <section className="section bg-brand-50">
        <div className="container-xl text-center max-w-2xl">
          <h2 className="display-sm mb-4">Want to Speak at Our Events?</h2>
          <p className="text-surface-600 mb-8">
            Are you an industry expert or practitioner? We welcome guest speakers for webinars, workshops and panel discussions.
          </p>
          <a
            href={`mailto:${siteConfig.admissionsEmail}?subject=${encodeURIComponent('Guest speaker application')}`}
            className="btn-primary btn inline-flex"
          >
            Apply as a Speaker
          </a>
        </div>
      </section>

      {/* Registration Modal */}
      {registering && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-xl mb-2">Register for Event</h3>
            <p className="text-sm text-surface-500 mb-6">
              {events.find(e => e.id === registering)?.title}. Submitting opens an email draft to admissions; send it to request registration.
            </p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Full Name *</label>
                <input required value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Email *</label>
                <input type="email" required value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Phone *</label>
                <input required value={regForm.phone} onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))} className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" placeholder="+91 99999 00000" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">Confirm Registration</Button>
                <Button type="button" variant="secondary" onClick={() => setRegistering(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CTASection />
    </div>
  );
}
