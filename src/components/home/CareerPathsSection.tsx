import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShinyText } from '../ui/ShinyText';

const paths = [
  {
    title: 'Fresher to Full Stack Developer',
    duration: '6 months',
    steps: ['Programming Basics', 'Frontend (React)', 'Backend (Java/Node)', 'Database & APIs', 'DevOps & Cloud', 'Capstone + Placement'],
    salary: '₹5–12 LPA',
    href: '/master-programs/freshers-master-program',
    gradient: 'from-brand-600 to-brand-400',
    dotColor: 'bg-brand-400',
  },
  {
    title: 'Career Switch to Data Science',
    duration: '5 months',
    steps: ['Python & Stats', 'Data Analysis & SQL', 'Machine Learning', 'Deep Learning', 'NLP & Gen AI', 'Portfolio + Placement'],
    salary: '₹6–15 LPA',
    href: '/master-programs/data-science-business-intelligence',
    gradient: 'from-purple-600 to-purple-400',
    dotColor: 'bg-purple-400',
  },
  {
    title: 'Cloud & DevOps Engineer',
    duration: '4 months',
    steps: ['Linux & Networking', 'AWS / Azure Core', 'Docker & Kubernetes', 'CI/CD & Terraform', 'Monitoring & Security', 'Certification Prep'],
    salary: '₹8–20 LPA',
    href: '/courses/aws-training',
    gradient: 'from-amber-500 to-amber-400',
    dotColor: 'bg-amber-400',
  },
];

export function CareerPathsSection() {
  return (
    <section className="section bg-white" aria-label="Career learning paths">
      <div className="container-xl">
        <div className="text-center mb-12">
          <p className="text-sm text-brand-700 font-bold uppercase tracking-wider mb-3">
            <ShinyText text="🚀 Structured career tracks" shinyColor="rgba(23, 108, 115, 0.9)" />
          </p>
          <h2 className="display-md">
            Your Career{' '}
            <span className="text-gradient">Roadmap</span>
          </h2>
          <p className="text-surface-700 font-medium mt-4 max-w-2xl mx-auto">
            Not sure where to start? Pick a career goal and follow a step-by-step learning path designed by industry experts.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {paths.map((path) => (
            <SpotlightCard key={path.title} className="h-full">
              <Link
                to={path.href}
                className="group block rounded-3xl border border-surface-200 overflow-hidden hover:shadow-card-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className={cn('p-6 bg-gradient-to-r text-white', path.gradient)}>
                    <h3 className="font-display font-bold text-lg mb-1">{path.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white font-medium">
                      <span>{path.duration}</span>
                      <span>•</span>
                      <span>Expected: {path.salary}</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {path.steps.map((step, i) => (
                        <div key={step} className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn('w-3 h-3 rounded-full shrink-0', path.dotColor)} />
                            {i < path.steps.length - 1 && (
                              <div className="w-px h-4 bg-surface-200" />
                            )}
                          </div>
                          <span className="text-sm text-surface-800 font-semibold">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-surface-200 flex items-center gap-2 text-sm font-bold text-brand-700 group-hover:text-brand-800">
                    Start this path
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
