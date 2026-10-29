import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Users, Target, Clock, Award, CheckCircle, Loader2, Send, Briefcase } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { enquiryService } from '../services/enquiryService';
import { cn } from '../utils/cn';
import { ShinyText } from '../components/ui/ShinyText';
import { DecryptedText } from '../components/ui/DecryptedText';
import { SpotlightCard } from '../components/ui/SpotlightCard';

const schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  contactName: z.string().min(2, 'Contact name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required'),
  country: z.string().min(1, 'Country required'),
  teamSize: z.string().min(1, 'Team size required'),
  trainingMode: z.string().min(1, 'Training mode required'),
  timeline: z.string().optional(),
  message: z.string().optional(),
  technologies: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const techOptions = ['AWS', 'Azure', 'GCP', 'DevOps', 'Kubernetes', 'Docker', 'Terraform', 'AI/ML', 'Data Science', 'Python', 'Java', 'Full Stack', 'Software Testing', 'Cyber Security', 'Power BI', 'Tableau', 'Other'];

const benefits = [
  { icon: Target, title: 'Customised Curriculum', desc: 'Training designed around your team\'s specific technology stack and goals.' },
  { icon: Users, title: 'Dedicated Trainer', desc: 'Industry expert assigned specifically to your corporate batch.' },
  { icon: Clock, title: 'Flexible Scheduling', desc: 'Training scheduled around your team\'s working hours.' },
  { icon: Award, title: 'Certification Support', desc: 'Guidance for relevant vendor certification exams.' },
  { icon: Building2, title: 'On-site or Online', desc: 'Deliver training at your premises or online globally.' },
  { icon: CheckCircle, title: 'Progress Reporting', desc: 'Detailed progress reports and skill assessments.' },
];

export default function CorporateTrainingPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    const result = await enquiryService.submitCorporateEnquiry({
      ...data,
      timeline: data.timeline ?? '',
      message: data.message ?? '',
      technologies: data.technologies ?? [],
    });
    if (result.success) {
      setSuccess(true);
      reset();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Corporate Training' }]} className="mb-4" />
          <div className="page-hero-badge mb-4">
            <Briefcase className="w-4 h-4 text-teal-600" />
            <ShinyText text="Enterprise Upskilling Solutions" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title display-lg font-extrabold mb-4">
            Corporate <DecryptedText text="Training" speed={30} maxIterations={10} className="page-hero-highlight" />
          </h1>
          <p className="page-hero-desc text-lg sm:text-xl max-w-2xl">
            Enterprise-grade, customised technology training for your teams — from cloud and DevOps to AI, data science, and modern software development.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-md mb-4">Why Corporate Training with Global Minds Technologies?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map(b => (
              <SpotlightCard key={b.title} className="h-full">
                <a href="#corporate-enquiry" className="block p-6 rounded-2xl border border-surface-200 bg-white hover:border-brand-300 hover:shadow-card-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 h-full" aria-label={`Request corporate training: ${b.title}`}>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                    <b.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-surface-900 mb-2">{b.title}</h3>
                  <p className="text-surface-600 text-sm leading-relaxed">{b.desc}</p>
                </a>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface-50" id="corporate-enquiry">
        <div className="container-xl">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-card">
              <h2 className="heading-xl mb-2">Request Corporate Training</h2>
              <p className="text-surface-600 text-sm mb-6 font-medium">Share your training requirements and our team will review your enquiry.</p>

              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-surface-900 text-lg mb-2">Enquiry Received!</h3>
                  <p className="text-surface-600 font-medium">Our corporate training team will contact you within 1 business day.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Company Name *</label>
                      <input type="text" placeholder="Your company" className={cn('form-input', errors.companyName && 'border-red-400')} {...register('companyName')} />
                      {errors.companyName && <p className="form-error">{errors.companyName.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Contact Person *</label>
                      <input type="text" placeholder="Your name" className={cn('form-input', errors.contactName && 'border-red-400')} {...register('contactName')} />
                      {errors.contactName && <p className="form-error">{errors.contactName.message}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Work Email *</label>
                      <input type="email" placeholder="you@company.com" className={cn('form-input', errors.email && 'border-red-400')} {...register('email')} />
                      {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Phone *</label>
                      <input type="tel" placeholder="+1 555 000 0000" className={cn('form-input', errors.phone && 'border-red-400')} {...register('phone')} />
                      {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Country *</label>
                      <input type="text" placeholder="India / USA / UAE..." className={cn('form-input', errors.country && 'border-red-400')} {...register('country')} />
                      {errors.country && <p className="form-error">{errors.country.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Team Size *</label>
                      <select className={cn('form-select', errors.teamSize && 'border-red-400')} {...register('teamSize')}>
                        <option value="">Select team size</option>
                        <option value="5-10">5–10</option>
                        <option value="11-25">11–25</option>
                        <option value="26-50">26–50</option>
                        <option value="51-100">51–100</option>
                        <option value="100+">100+</option>
                      </select>
                      {errors.teamSize && <p className="form-error">{errors.teamSize.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Training Mode *</label>
                    <select className={cn('form-select', errors.trainingMode && 'border-red-400')} {...register('trainingMode')}>
                      <option value="">Select mode</option>
                      <option value="Online">Online</option>
                      <option value="On-site">On-site at our premises</option>
                      <option value="At Training Centre">At Global Minds Technologies centre</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    {errors.trainingMode && <p className="form-error">{errors.trainingMode.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Technologies / Topics</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {techOptions.map(tech => (
                        <label key={tech} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" value={tech} className="w-3.5 h-3.5 text-brand-600 rounded border-surface-300" {...register('technologies')} />
                          <span className="text-xs text-surface-800 font-medium">{tech}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Preferred Timeline</label>
                    <input type="text" placeholder="e.g. Q4 2026, ASAP, January 2027" className="form-input" {...register('timeline')} />
                  </div>
                  <div>
                    <label className="form-label">Message / Requirements</label>
                    <textarea rows={3} placeholder="Describe your training needs, specific topics, or any other requirements..." className="form-input resize-none" {...register('message')} />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary btn w-full">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Submit Corporate Enquiry</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Upskill Your Entire Team"
        subtitle="Customised corporate training for cloud, DevOps, AI, data and software development."
        primaryLabel="Request Training"
        primaryHref="#corporate-enquiry"
        secondaryLabel="View All Courses"
        secondaryHref="/courses"
      />
    </div>
  );
}
