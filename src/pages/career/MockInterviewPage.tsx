import { useState } from 'react';
import { Mic, Video, CheckCircle, Star, Clock, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CTASection } from '../../components/home/CTASection';
import { usePageMeta } from '../../hooks/usePageMeta';
import { enquiryService } from '../../services/enquiryService';
import { cn } from '../../utils/cn';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { StarBorder } from '../../components/ui/StarBorder';

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone required'),
  targetRole: z.string().min(3, 'Target role required'),
  technology: z.string().min(1, 'Please select a technology'),
  experience: z.string().min(1, 'Please select experience level'),
  interviewFormat: z.string().min(1, 'Please choose an interview format'),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const mockFormats = [
  {
    icon: Mic,
    title: 'Technical Interview Simulation',
    duration: '45–60 min',
    color: 'bg-brand-50 text-brand-600',
    features: ['Domain-specific questions', 'Code walkthrough', 'Architecture discussion', 'Written feedback report'],
  },
  {
    icon: Video,
    title: 'HR & Behavioural Round',
    duration: '30–45 min',
    color: 'bg-green-50 text-green-600',
    features: ['Behavioural questions (STAR)', 'Communication assessment', 'Salary negotiation practice', 'Feedback and tips'],
  },
  {
    icon: Star,
    title: 'Full Interview Loop',
    duration: '90 min',
    color: 'bg-purple-50 text-purple-600',
    features: ['Technical + HR rounds', 'Aptitude section', 'Detailed feedback report', 'Follow-up Q&A session'],
  },
];

export default function MockInterviewPage() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const selectedFormat = watch('interviewFormat');

  usePageMeta({
    title: 'Mock Interview Booking',
    description: 'Book a realistic mock interview session with Global Minds Academy career experts — technical, HR or full interview loop with detailed feedback.',
  });

  const onSubmit = async (data: FormData) => {
    await enquiryService.submitEnquiry({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      country: 'India',
      course: `Mock Interview — ${data.targetRole}`,
      message: `Interview Format: ${data.interviewFormat} | Technology: ${data.technology} | Experience: ${data.experience} | Preferred Date: ${data.preferredDate ?? 'Flexible'} | Notes: ${data.notes ?? ''}`,
      consent: true,
    });
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16">
        <div className="container-xl relative z-10">
          <Breadcrumbs
            items={[{ label: 'Career', href: '/career' }, { label: 'Mock Interview' }]}
            className="mb-4"
          />
          <div className="page-hero-badge mb-4">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <ShinyText text="1-on-1 Senior Industry Evaluators" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title display-lg font-extrabold mb-4">
            Mock <DecryptedText text="Interviews" speed={30} maxIterations={10} className="page-hero-highlight" />
          </h1>
          <p className="page-hero-desc text-lg sm:text-xl max-w-2xl">
            Realistic interview simulations with detailed actionable feedback — practice under real interview conditions before facing hiring managers.
          </p>
        </div>
      </div>

      {/* Formats */}
      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-md mb-4">Interview Formats</h2>
            <p className="text-surface-600 max-w-xl mx-auto font-medium">Choose the format that matches your preparation needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {mockFormats.map(f => (
              <SpotlightCard key={f.title} className="h-full">
                <article
                  className={`rounded-3xl border overflow-hidden hover:shadow-card-xl transition-all duration-300 h-full flex flex-col justify-between ${
                    selectedFormat === f.title ? 'border-brand-600 ring-2 ring-brand-300 shadow-card-xl' : 'border-surface-200'
                  }`}
                >
                  <div className="bg-surface-50 p-6 text-center border-b border-surface-200">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${f.color}`}>
                      <f.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display font-bold text-surface-900 text-lg mb-1">{f.title}</h3>
                    <div className="flex items-center justify-center gap-1.5 text-sm text-surface-600 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {f.duration}
                    </div>
                  </div>
                  <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                    <ul className="space-y-2.5">
                      {f.features.map(feat => (
                        <li key={feat} className="flex items-center gap-2.5 text-sm text-surface-700 font-medium">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      aria-pressed={selectedFormat === f.title}
                      onClick={() => {
                        setValue('interviewFormat', f.title, { shouldValidate: true });
                        document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-md transition-colors"
                    >
                      {selectedFormat === f.title ? '✓ Format Selected' : 'Choose This Format'}
                    </button>
                  </div>
                </article>
              </SpotlightCard>
            ))}
          </div>
          {errors.interviewFormat && (
            <p className="form-error text-center mt-4" role="alert">{errors.interviewFormat.message}</p>
          )}
        </div>
      </section>

      {/* Booking Form */}
      <section className="section bg-surface-50" id="book">
        <div className="container-xl">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-surface-900 text-xl">Book a Mock Interview</h2>
                  <p className="text-surface-600 text-sm font-medium">Our team will confirm the session within 24 hours.</p>
                </div>
              </div>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-surface-900 text-lg mb-2">Booking Request Submitted!</h3>
                  <p className="text-surface-600 font-medium">Our career team will contact you within 24 hours to confirm the session.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...register('interviewFormat')} />
                  <p className="text-sm text-brand-800 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 font-medium">
                    Selected format: <span className="font-bold text-brand-900">{selectedFormat || 'Choose a format above'}</span>
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input type="text" placeholder="Your name" className={cn('form-input', errors.fullName && 'border-red-400')} {...register('fullName')} />
                      {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input type="email" placeholder="you@email.com" className={cn('form-input', errors.email && 'border-red-400')} {...register('email')} />
                      {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Phone *</label>
                      <input type="tel" placeholder="+91 99999 00000" className={cn('form-input', errors.phone && 'border-red-400')} {...register('phone')} />
                      {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Target Job Role *</label>
                      <input type="text" placeholder="e.g. DevOps Engineer, Data Scientist" className={cn('form-input', errors.targetRole && 'border-red-400')} {...register('targetRole')} />
                      {errors.targetRole && <p className="form-error">{errors.targetRole.message}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Technology Domain *</label>
                      <select className="form-select" {...register('technology')}>
                        <option value="">Select domain</option>
                        {['Cloud / AWS / Azure / GCP', 'DevOps / Kubernetes', 'Full Stack (React/Node/Java)', 'Data Science / ML / AI', 'Python / Java', 'Software Testing / QA', 'Cyber Security', 'Data Analytics / Power BI', 'Other'].map(t => <option key={t}>{t}</option>)}
                      </select>
                      {errors.technology && <p className="form-error">{errors.technology.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Experience Level *</label>
                      <select className="form-select" {...register('experience')}>
                        <option value="">Select level</option>
                        {['Fresher / 0 years', '0–1 years', '1–3 years', '3–5 years', '5+ years'].map(e => <option key={e}>{e}</option>)}
                      </select>
                      {errors.experience && <p className="form-error">{errors.experience.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Preferred Date</label>
                    <input type="date" className="form-input" {...register('preferredDate')} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="form-label">Additional Notes</label>
                    <textarea rows={3} placeholder="Specific topics, areas of concern, or any other details..." className="form-input resize-none" {...register('notes')} />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary btn w-full flex items-center justify-center gap-2">
                    {isSubmitting ? 'Submitting...' : <><Mic className="w-4 h-4" /> Request Mock Interview</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Practice Makes Perfect"
        subtitle="Simulate real interview conditions, get expert feedback and walk into your next interview with confidence."
        primaryLabel="Book Now"
        primaryHref="#book"
        secondaryLabel="Interview Prep Guide"
        secondaryHref="/career/interview-preparation"
      />
    </div>
  );
}
