import { BookOpenCheck, Code2, MapPin, Target, UsersRound } from 'lucide-react';
import { SpotlightCard } from '../ui/SpotlightCard';
import { DotPattern } from '../ui/DotPattern';
import { ShinyText } from '../ui/ShinyText';

const advantages = [
  {
    icon: BookOpenCheck,
    title: 'Structured learning',
    description: 'Follow a clear course path from core concepts to practical application.',
  },
  {
    icon: Code2,
    title: 'Learn by doing',
    description: 'Reinforce your learning with guided exercises and hands-on projects.',
  },
  {
    icon: UsersRound,
    title: 'Instructor guidance',
    description: 'Get support from instructors as you work through your course.',
  },
  {
    icon: Target,
    title: 'Career-focused practice',
    description: 'Build skills and prepare to discuss your work with future employers.',
  },
];

export function WhyUsSection() {
  return (
    <section className="section bg-white relative overflow-hidden" aria-label="How we support your learning">
      <DotPattern className="opacity-35" />
      <div className="container-xl relative z-10">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-700">
            <ShinyText text="✨ Learn with confidence" shinyColor="rgba(23, 108, 115, 0.95)" />
          </p>
          <h2 className="display-md text-surface-900">
            Practical learning, <span className="text-gradient">step by step</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-surface-600 leading-relaxed">
            Build your knowledge with a supportive learning experience designed around real skills and steady progress.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map(item => (
            <SpotlightCard key={item.title} className="h-full">
              <article className="rounded-2xl border border-surface-200 bg-surface-50 p-6 transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-md h-full">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm border border-surface-200">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-display font-bold text-surface-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-surface-700">{item.description}</p>
              </article>
            </SpotlightCard>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-surface-700">
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Choose live online learning or in-person classes in Chennai.
        </div>
      </div>
    </section>
  );
}
