import { Link } from 'react-router-dom';
import { Linkedin, Star, Users, Award, ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { instructors } from '../data/instructors';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';
import { Badge } from '../components/ui/Badge';
import { useCmsCollection } from '../hooks/useCmsCollection';

export default function TrainersPage() {
  const [expandedTrainers, setExpandedTrainers] = useState<Set<string>>(new Set());
  const visibleInstructors = useCmsCollection('instructors', instructors);

  usePageMeta({
    title: 'Expert Trainers & Instructors',
    description: 'Meet the Global Minds Academy expert trainers — certified industry professionals with real-world project experience in cloud, DevOps, AI, data science and more.',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Trainers' }]} className="text-white/50 mb-4" />
          <h1 className="display-lg text-white mb-4">Expert Trainers</h1>
          <p className="text-white/70 text-xl max-w-2xl">
            Learn from certified industry professionals with real-world experience in the technologies they teach.
          </p>
          <p className="text-white/40 text-sm mt-3">
            * Placeholder trainer profiles — to be replaced with real instructor information.
          </p>
        </div>
      </div>

      {/* Trainers Grid */}
      <section className="section" aria-label="Trainer profiles">
        <div className="container-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleInstructors.map(trainer => {
              const isExpanded = expandedTrainers.has(trainer.id);
              const detailsId = `trainer-details-${trainer.id}`;
              return (
              <div
                key={trainer.id}
                className="bg-white rounded-3xl border border-surface-100 overflow-hidden hover:shadow-card-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white text-center">
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 border-4 border-white/20"
                    loading="lazy"
                  />
                  <h2 className="font-display font-bold text-xl mb-1">{trainer.name}</h2>
                  <p className="text-brand-200 text-sm">{trainer.designation}</p>
                  <p className="text-white/60 text-xs mt-1">{trainer.experience} experience</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 border-b border-surface-100">
                  <div className="p-4 text-center border-r border-surface-100">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-surface-900">{trainer.rating ?? 4.8}</span>
                    </div>
                    <p className="text-xs text-surface-400">Rating</p>
                  </div>
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-brand-500" />
                      <span className="font-bold text-surface-900">
                        {trainer.totalStudents ? `${(trainer.totalStudents / 1000).toFixed(0)}K+` : '1K+'}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400">Students</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Expertise */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-surface-400 uppercase mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(isExpanded ? trainer.expertise : trainer.expertise.slice(0, 5)).map(e => (
                        <Badge key={e} variant="brand" className="text-xs">{e}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-surface-400 uppercase mb-2">Certifications</p>
                    <ul className="space-y-1">
                      {(isExpanded ? trainer.certifications : trainer.certifications.slice(0, 3)).map(cert => (
                        <li key={cert} className="flex items-center gap-2 text-xs text-surface-600">
                          <Award className="w-3 h-3 text-accent-500 flex-shrink-0" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bio */}
                  <p className={`text-sm text-surface-500 leading-relaxed mb-3 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {trainer.bio}
                  </p>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => setExpandedTrainers(current => {
                      const next = new Set(current);
                      if (next.has(trainer.id)) next.delete(trainer.id);
                      else next.add(trainer.id);
                      return next;
                    })}
                    className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  >
                    {isExpanded ? 'Show less' : 'Show full profile'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <div id={detailsId} hidden={!isExpanded} className="mb-5 text-xs text-surface-500">
                    Teaching {trainer.courses.length} courses across {trainer.expertise.length} areas of expertise.
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                    {trainer.linkedIn ? (
                      <a
                        href={trainer.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                        aria-label={`${trainer.name} LinkedIn profile`}
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    ) : <span />}
                    <Link
                      to="/courses"
                      className="text-sm text-surface-500 hover:text-brand-600 flex items-center gap-1"
                    >
                      View Courses <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Join as trainer CTA */}
          <div className="mt-16 p-10 rounded-3xl bg-surface-50 border border-surface-100 text-center">
            <h2 className="font-display font-bold text-2xl text-surface-900 mb-3">
              Are You an Industry Expert?
            </h2>
            <p className="text-surface-500 mb-6 max-w-xl mx-auto">
              Global Minds Academy is always looking for passionate, certified industry professionals to join our trainer network. PLACEHOLDER — contact details to be updated.
            </p>
            <Link to="/contact">
              <button className="btn-primary btn inline-flex items-center gap-2">
                Contact Us <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Learn from the Best"
        subtitle="Expert trainers, real-world projects, industry certification guidance."
        primaryLabel="Explore Courses"
        primaryHref="/courses"
        secondaryLabel="Talk to an Expert"
        secondaryHref="/contact"
      />
    </div>
  );
}
