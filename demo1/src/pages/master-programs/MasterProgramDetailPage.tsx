import { useParams, Link } from 'react-router-dom';
import { masterPrograms } from '../../data/masterPrograms';
import { Clock, BookOpen, Award, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../../utils/formatters';
import { FAQAccordion } from '../../components/ui/FAQAccordion';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function MasterProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const visiblePrograms = useCmsCollection('master-programs', masterPrograms);
  const program = visiblePrograms.find(item => item.slug === (slug || ''));
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">Program Not Found</h1>
          <Link to="/master-programs" className="btn-primary btn">View All Programs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-14">
        <div className="container-xl">
          <Breadcrumbs
            items={[{ label: 'Master Programs', href: '/master-programs' }, { label: program.title }]}
            className="text-white/50 mb-4"
          />
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 mb-4">
                <Award className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold text-brand-300">Master Program</span>
              </div>
              <h1 className="display-md text-white mb-3">{program.title}</h1>
              <p className="text-brand-300 text-lg font-medium mb-4">{program.tagline}</p>
              <p className="text-white/70 mb-6">{program.shortDescription}</p>
              <div className="flex flex-wrap gap-5 text-sm text-white/70">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{program.duration}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{program.modules.length} modules</span>
              </div>
            </div>
            <div className="relative aspect-[16/9] min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-surface-100 shadow-card-lg lg:aspect-auto lg:min-h-[24rem]">
              <img
                src={program.banner}
                alt={`${program.title} learning program`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="heading-xl mb-4">Program Overview</h2>
              <p className="text-surface-600 leading-relaxed">{program.longDescription}</p>
            </section>

            {/* Who should join */}
            <section>
              <h2 className="heading-xl mb-4">Who Should Join</h2>
              <ul className="space-y-2">
                {program.targetAudience.map((a, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{a}
                  </li>
                ))}
              </ul>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="heading-xl mb-6">Program Curriculum</h2>
              <div className="space-y-3">
                {program.modules.map((mod, i) => (
                  <div key={mod.id} className="border border-surface-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenModuleId(openModuleId === mod.id ? null : mod.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="font-semibold text-surface-900 text-sm text-left">{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-surface-400">{mod.duration}</span>
                        <ChevronDown className={cn('w-4 h-4 text-surface-400 transition-transform', openModuleId === mod.id && 'rotate-180')} />
                      </div>
                    </button>
                    <div className={cn('overflow-hidden transition-all duration-300', openModuleId === mod.id ? 'max-h-96' : 'max-h-0')}>
                      <div className="px-4 pb-4 border-t border-surface-100 pt-3">
                        <ul className="space-y-2 mb-3">
                          {mod.topics.map((t, j) => (
                            <li key={j} className="flex items-center gap-2.5 text-sm text-surface-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />{t}
                            </li>
                          ))}
                        </ul>
                        {mod.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {mod.tools.map(tool => (
                              <span key={tool} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-lg">{tool}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Career */}
            <section>
              <h2 className="heading-xl mb-4">Career Outcomes</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {program.careerOutcomes.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-surface-50 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-surface-700">{c}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section>
              <h2 className="heading-xl mb-6">FAQs</h2>
              <FAQAccordion faqs={program.faqs} />
            </section>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky-enroll">
              <div className="text-3xl font-black text-surface-900 mb-1">{formatPrice(program.discountPrice, program.currency)}</div>
              <div className="text-surface-400 line-through text-sm mb-4">{formatPrice(program.price, program.currency)}</div>
              <div className="space-y-3 mb-6">
                <Link to="/register"><Button size="lg" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>Enroll Now</Button></Link>
                <Button variant="secondary" size="lg" fullWidth onClick={() => document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Request Callback
                </Button>
              </div>
              <div className="space-y-3 border-t border-surface-100 pt-5 text-sm">
                {[
                  { label: 'Duration', value: program.duration },
                  { label: 'Total Hours', value: `${program.totalHours}h` },
                  { label: 'Modules', value: `${program.modules.length}` },
                  { label: 'Projects', value: `${program.projects}` },
                  { label: 'Certificate', value: 'Included' },
                  { label: 'Placement', value: program.placementSupport ? 'Included' : 'N/A' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-surface-500">{item.label}</span>
                    <span className="font-semibold text-surface-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enquiry Form */}
        <div id="enquiry-form" className="mt-16 max-w-2xl mx-auto">
          <div className="bg-surface-50 rounded-3xl p-8">
            <EnquiryForm preselectedCourse={program.title} title="Enquire About This Program" />
          </div>
        </div>
      </div>
    </div>
  );
}
