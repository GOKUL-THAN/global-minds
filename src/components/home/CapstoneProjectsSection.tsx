import { ArrowRight, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShinyText } from '../ui/ShinyText';

const projects = [
  {
    course: 'Full Stack Development',
    title: 'Smart Employee Management System',
    description: 'Build employee, attendance, payroll and leave-management features with secure role-based access.',
    tools: ['Java', 'Spring Boot', 'React', 'MySQL'],
    tone: 'bg-brand-50 text-brand-700',
  },
  {
    course: 'Data Science & AI',
    title: 'AI Healthcare Assistant',
    description: 'Explore a healthcare project combining predictive models, image analysis and an interactive dashboard.',
    tools: ['Python', 'Machine Learning', 'Streamlit'],
    tone: 'bg-purple-50 text-purple-700',
  },
  {
    course: 'AWS / Cloud',
    title: 'Cloud-Based E-Commerce Deployment',
    description: 'Practice deploying a scalable application with cloud services, containers and an automated delivery pipeline.',
    tools: ['AWS', 'Docker', 'Terraform', 'CI/CD'],
    tone: 'bg-amber-50 text-amber-700',
  },
];

export function CapstoneProjectsSection() {
  return (
    <section className="section bg-surface-50" aria-label="Industry capstone projects">
      <div className="container-xl">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-700">
              <ShinyText text="⚡ Real-world capstone portfolio" shinyColor="rgba(23, 108, 115, 0.9)" />
            </p>
            <h2 className="display-md text-surface-900">
              Explore Industry <span className="text-gradient">Capstone Projects</span>
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-surface-600">
              Apply your skills to guided, practical projects across development, data science and cloud technologies.
            </p>
          </div>
          <Link to="/live-projects">
            <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Live Projects
            </Button>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <SpotlightCard key={project.title} className="h-full">
              <article className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm transition-all duration-300 hover:shadow-card-lg h-full flex flex-col justify-between">
                <div>
                  <div className={`flex h-36 items-center justify-center ${project.tone}`}>
                    <Code2 className="h-14 w-14 opacity-80" aria-hidden="true" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{project.course}</p>
                    <h3 className="mt-2 font-display text-lg font-bold text-surface-900">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-surface-700">{project.description}</p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <ul className="flex flex-wrap gap-2" aria-label="Technologies">
                    {project.tools.map(tool => (
                      <li key={tool} className="rounded-full border border-surface-200 bg-surface-50 px-2.5 py-1 text-xs font-medium text-surface-700">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
