import { BookOpenCheck, Code2, MapPin, Target, UsersRound } from 'lucide-react';

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
    <section className="section bg-white" aria-label="How we support your learning">
      <div className="container-xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">Learn with confidence</p>
          <h2 className="display-md">
            Practical learning, <span className="text-gradient">step by step</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-surface-500">
            Build your knowledge with a supportive learning experience designed around real skills and steady progress.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map(item => (
            <article key={item.title} className="rounded-2xl border border-surface-100 bg-surface-50 p-6 transition-all hover:-translate-y-1 hover:border-brand-100 hover:shadow-card-md">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-display font-semibold text-surface-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-surface-600">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-surface-600">
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Choose live online learning or in-person classes in Chennai.
        </div>
      </div>
    </section>
  );
}
