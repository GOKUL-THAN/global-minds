import { Link } from 'react-router-dom';
import { Monitor, MapPin, User, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const modes = [
  {
    icon: Monitor,
    title: 'Online Training',
    href: '/online-training',
    description: 'Live instructor-led classes from anywhere in the world. Includes recorded sessions, doubt clearing and LMS access.',
    features: ['Live classes', 'Recorded sessions', 'Global access', 'LMS portal', 'Doubt sessions'],
    color: 'from-brand-600 to-brand-500',
    lightColor: 'bg-brand-50',
    textColor: 'text-brand-600',
    badge: 'Learn from anywhere',
  },
  {
    icon: MapPin,
    title: 'Classroom Training',
    href: '/classroom-training',
    description: 'Hands-on classroom training at our Chennai centre with fully equipped computer labs.',
    features: ['Physical labs', 'Face-to-face mentoring', 'Group projects', 'Networking events', 'Placement support'],
    color: 'from-green-600 to-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600',
    badge: 'Hands-on experience',
  },
  {
    icon: User,
    title: 'One-to-One Training',
    href: '/online-training',
    description: 'Personalised one-to-one sessions designed around your pace, schedule and specific goals.',
    features: ['Custom curriculum', 'Flexible timing', 'Personal mentor', 'Rapid progress', 'Interview prep'],
    color: 'from-accent-500 to-accent-400',
    lightColor: 'bg-accent-50',
    textColor: 'text-accent-600',
    badge: 'Personalised learning',
  },
];

export function LearningModesSection() {
  return (
    <section className="section bg-white" aria-label="Learning modes">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">
            Your preferred way to learn
          </p>
          <h2 className="display-md">
            Flexible{' '}
            <span className="text-gradient">Learning Modes</span>
          </h2>
          <p className="text-surface-500 mt-4 max-w-xl mx-auto">
            Learn online from anywhere, attend in-person classes at our Chennai centre, or choose one-to-one personal training.
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {modes.map((mode) => (
            <div
              key={mode.title}
              className="group rounded-3xl overflow-hidden border border-surface-100 hover:shadow-card-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card top */}
              <div className={cn('p-8 bg-gradient-to-br', mode.color)}>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                  <mode.icon className="w-7 h-7 text-white" />
                </div>
                <div className="inline-flex px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
                  {mode.badge}
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-2">{mode.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{mode.description}</p>
              </div>

              {/* Card bottom */}
              <div className="p-6 bg-white">
                <ul className="space-y-2.5 mb-6">
                  {mode.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-surface-600">
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', mode.lightColor.replace('bg-', 'bg-').replace('-50', '-400'))} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={mode.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-semibold transition-colors',
                    mode.textColor,
                    `hover:${mode.textColor.replace('600', '700')}`,
                  )}
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
