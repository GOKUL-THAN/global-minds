import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, MessageSquare, Clock, CheckCircle, Loader2, Send } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { siteConfig } from '../data/siteConfig';
import { enquiryService } from '../services/enquiryService';
import { cn } from '../utils/cn';

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone required'),
  subject: z.string().min(3, 'Subject required'),
  message: z.string().min(10, 'Please write a message (min 10 characters)'),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    const result = await enquiryService.submitContact(data);
    if (result.success) {
      setSuccess(true);
      reset();
    } else {
      setError(result.message);
    }
  };

  const contacts = [
    { icon: Phone, label: 'Phone', value: siteConfig.phone, href: `tel:${siteConfig.phone}` },
    { icon: Mail, label: 'Email', value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: MessageSquare, label: 'WhatsApp', value: 'Chat with us', href: `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMessage)}` },
    { icon: Clock, label: 'Hours', value: siteConfig.businessHours, href: undefined },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Contact' }]} className="mb-4" />
          <div className="page-hero-badge mb-4">
            Connect With Our Advisors • 24hr Turnaround
          </div>
          <h1 className="page-hero-title mb-4">
            Get in <span className="page-hero-highlight">Touch</span>
          </h1>
          <p className="page-hero-desc text-lg sm:text-xl max-w-2xl leading-relaxed">
            Get in touch with our team for course enquiries, career counseling, corporate training or general questions.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="page-hero-chip">Free 1-on-1 Consultation</div>
            <div className="page-hero-chip">Instant WhatsApp Connect</div>
            <div className="page-hero-chip">Campus Visits Welcome</div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="heading-xl mb-8">Get in Touch</h2>
              <div className="space-y-5 mb-10">
                {contacts.map(c => (
                  <div key={c.label} className="flex items-center gap-4 p-4 bg-surface-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-surface-600">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="text-surface-900 font-bold hover:text-brand-700 transition-colors">{c.value}</a>
                      ) : (
                        <p className="text-surface-900 font-bold">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 bg-surface-50 rounded-2xl mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-surface-600 mb-1">Address</p>
                  <p className="text-surface-900 font-bold">{siteConfig.address.line1}</p>
                  <p className="text-surface-700 text-sm">{siteConfig.address.city}, {siteConfig.address.state}, {siteConfig.address.country}</p>
                </div>
              </div>

              <p className="text-surface-600 text-sm font-medium">Response within 24 hours on business days.</p>
            </div>

            {/* Form */}
            <div className="bg-surface-50 rounded-3xl p-8">
              <h2 className="heading-xl mb-6">Send a Message</h2>

              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold text-surface-900 text-lg mb-2">Message Sent!</h3>
                  <p className="text-surface-500">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
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
                  <div>
                    <label className="form-label">Phone *</label>
                    <input type="tel" placeholder="+91 99999 00000" className={cn('form-input', errors.phone && 'border-red-400')} {...register('phone')} />
                    {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Subject *</label>
                    <input type="text" placeholder="Course enquiry / Career counseling / Other" className={cn('form-input', errors.subject && 'border-red-400')} {...register('subject')} />
                    {errors.subject && <p className="form-error">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea rows={5} placeholder="How can we help you?" className={cn('form-input resize-none', errors.message && 'border-red-400')} {...register('message')} />
                    {errors.message && <p className="form-error">{errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary btn w-full">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
