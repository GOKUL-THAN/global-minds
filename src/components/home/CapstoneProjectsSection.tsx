import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShinyText } from '../ui/ShinyText';

const projects = [
  {
    course: 'Full Stack Projects',
    title: 'E-Commerce Platform',
    image: '/images/courses/mern-stack.jpg',
    difficulty: 'Advanced',
    description: 'Full-featured online store with product catalog, cart, checkout, payments and admin dashboard.',
    tools: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    outcomes: ['REST API design', 'Authentication & JWT', 'Payment integration', 'Admin panel'],
    tone: 'border-brand-200',
  },
  {
    course: 'Data Science & AI Projects',
    title: 'Sentiment Analysis Pipeline',
    image: '/images/courses/nlp.jpg',
    difficulty: 'Advanced',
    description: 'NLP pipeline that classifies product reviews as positive/negative/neutral using BERT fine-tuning.',
    tools: ['Python', 'BERT', 'Hugging Face', 'FastAPI'],
    outcomes: ['NLP preprocessing', 'Transformer models', 'Model fine-tuning', 'REST API serving'],
    tone: 'border-purple-200',
  },
  {
    course: 'DevOps & Cloud Projects',
    title: 'Kubernetes Microservices Deployment',
    image: '/images/courses/kubernetes.jpg',
    difficulty: 'Advanced',
    description: 'Deploy a multi-service application on Kubernetes with autoscaling, service mesh and monitoring.',
    tools: ['Kubernetes', 'Helm', 'Prometheus', 'Grafana'],
    outcomes: ['Kubernetes objects', 'Helm charts', 'HPA & VPA', 'Observability'],
    tone: 'border-orange-200',
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
              Explore hands-on projects in full-stack development, data science, and cloud engineering.
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
              <article className={`flex h-full flex-col overflow-hidden rounded-2xl border-2 ${project.tone} bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-card-lg`}>
                <img
                  src={project.image}
                  alt={`${project.title} project`}
                  loading="lazy"
                  className="mb-5 aspect-video w-full rounded-xl object-cover"
                />
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{project.course}</p>
                    <h3 className="mt-2 font-display text-lg font-bold text-surface-900">{project.title}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                    {project.difficulty}
                  </span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-surface-700">{project.description}</p>
                <ul className="mb-5 flex flex-wrap gap-2" aria-label="Technologies">
                  {project.tools.map(tool => (
                    <li key={tool} className="rounded-full border border-surface-300 bg-white px-2.5 py-1 text-xs font-semibold text-surface-800">
                      {tool}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-surface-800">What you'll build:</p>
                  <ul className="space-y-1">
                    {project.outcomes.map(outcome => (
                      <li key={outcome} className="flex items-center gap-2 text-sm text-surface-700">
                        <Check className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" />
                        {outcome}
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
