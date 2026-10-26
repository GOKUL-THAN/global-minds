import { BookOpen, Briefcase, Cloud, Code, Cpu, ShieldCheck, TestTube2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const achievements = [
  { icon: Cloud, title: 'AWS / Cloud' },
  { icon: BookOpen, title: 'Data Science' },
  { icon: Cpu, title: 'Machine Learning' },
  { icon: Code, title: 'Full Stack Development' },
  { icon: ShieldCheck, title: 'Cyber Security' },
  { icon: TestTube2, title: 'Software Testing' },
  { icon: TestTube2, title: 'Automation Testing' },
  { icon: Briefcase, title: '50+ Hiring Partners' },
];

export function AchievementsSection() {
  return (
    <section className="py-12 bg-surface-50 border-y border-surface-100" aria-label="Courses and hiring partners">
      <div className="container-xl">
        <div className="text-center mb-10">
          <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">
            Courses &amp; Hiring Partners
          </p>
          <h2 className="display-md">
            <span className="text-gradient">What We Offer</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((item) => (
            <div
              key={item.title}
              className={cn(
                'group flex flex-col items-center text-center p-5 rounded-2xl',
                'bg-white border border-surface-100',
                'hover:shadow-card-md hover:-translate-y-1 transition-all duration-300',
              )}
            >
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center mb-3',
                'group-hover:scale-110 transition-transform',
                'bg-brand-50',
              )}>
                <item.icon className={cn('w-7 h-7 text-brand-500')} />
              </div>
              <h3 className="font-semibold text-surface-900 text-sm mb-1">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
