import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';
import { siteConfig } from '../../data/siteConfig';
import { cn } from '../../utils/cn';

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Please select your country'),
  course: z.string().optional(),
  mode: z.string().optional(),
  message: z.string().optional(),
  consent: z.boolean().refine(v => v === true, 'You must agree to be contacted'),
});

type FormData = z.infer<typeof schema>;

interface EnquiryFormProps {
  preselectedCourse?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export function EnquiryForm({
  preselectedCourse,
  title = 'Get Free Counseling',
  subtitle = 'Fill out the form and our team will contact you within 24 hours.',
  className,
  compact = false,
}: EnquiryFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { courses, loading: coursesLoading, error: coursesError } = useCourseCatalog();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { course: preselectedCourse || '', mode: '', consent: false },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const result = await enquiryService.submitEnquiry({ ...data, city: '' });
      if (result.success) {
        setSuccess(true);
        reset();
      } else {
        setError(result.message);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit your enquiry. Please try again.');
    }
  };

  if (success) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="font-display font-bold text-surface-900 text-xl mb-2">Thank You!</h3>
        <p className="text-surface-500 mb-2">Your enquiry has been sent to our admissions team.</p>
        <p className="text-surface-400 text-xs mb-4">Our team will contact you soon. You can also reach us at {siteConfig.email} or {siteConfig.phone}.</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {!compact && (
        <div className="mb-6">
          <h3 className="font-display font-bold text-surface-900 text-xl mb-1">{title}</h3>
          <p className="text-surface-500 text-sm">{subtitle}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="form-label" htmlFor="enq-name">Full Name *</label>
          <input
            id="enq-name"
            type="text"
            required
            placeholder="Enter your full name"
            className={cn('form-input', errors.fullName && 'border-red-400 focus:border-red-400')}
            aria-invalid={!!errors.fullName}
            aria-required="true"
            aria-describedby={errors.fullName ? 'enq-name-error' : undefined}
            autoComplete="name"
            {...register('fullName')}
          />
          {errors.fullName && <p id="enq-name-error" className="form-error">{errors.fullName.message}</p>}
        </div>

        {/* Email + Phone row */}
        <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
          <div>
            <label className="form-label" htmlFor="enq-email">Email *</label>
            <input
              id="enq-email"
              type="email"
              required
              placeholder="your@email.com"
              className={cn('form-input', errors.email && 'border-red-400')}
              aria-invalid={!!errors.email}
              aria-required="true"
              aria-describedby={errors.email ? 'enq-email-error' : undefined}
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p id="enq-email-error" className="form-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="enq-phone">Phone *</label>
            <input
              id="enq-phone"
              type="tel"
              required
              placeholder="+91 99999 00000"
              className={cn('form-input', errors.phone && 'border-red-400')}
              aria-invalid={!!errors.phone}
              aria-required="true"
              aria-describedby={errors.phone ? 'enq-phone-error' : undefined}
              autoComplete="tel"
              {...register('phone')}
            />
            {errors.phone && <p id="enq-phone-error" className="form-error">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="form-label" htmlFor="enq-country">Country *</label>
          <select
            id="enq-country"
            required
            className={cn('form-select', errors.country && 'border-red-400')}
            aria-invalid={!!errors.country}
            aria-required="true"
            aria-describedby={errors.country ? 'enq-country-error' : undefined}
            {...register('country')}
          >
            <option value="">Select your country</option>
            {siteConfig.countries.map(c => (
              <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
            ))}
          </select>
          {errors.country && <p id="enq-country-error" className="form-error">{errors.country.message}</p>}
        </div>

        {/* Course */}
        <div>
          <label className="form-label" htmlFor="enq-course">Interested Course</label>
          <select id="enq-course" className="form-select" {...register('course')}>
            <option value="">Select a course (optional)</option>
            {courses.map(course => (
              <option key={course.id} value={course.title}>{course.title}</option>
            ))}
          </select>
          {coursesError && <p className="mt-1 text-xs text-surface-500">Course options are temporarily unavailable.</p>}
          {coursesLoading && <p className="mt-1 text-xs text-surface-500">Loading course options…</p>}
        </div>

        {/* Mode */}
        {!compact && (
          <div>
            <label className="form-label" htmlFor="enq-mode">Preferred Training Mode</label>
            <select id="enq-mode" className="form-select" {...register('mode')}>
              <option value="">Select training mode</option>
              <option value="Online">Online (Live)</option>
              <option value="Classroom">Classroom</option>
              <option value="One-to-One">One-to-One</option>
            </select>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="form-label" htmlFor="enq-message">Message <span className="font-normal text-surface-400">(optional)</span></label>
          <textarea
            id="enq-message"
            rows={compact ? 2 : 3}
            placeholder="Any specific requirements or questions..."
            className="form-input resize-none"
            {...register('message')}
          />
        </div>

        {/* Consent */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'enq-consent-error' : undefined}
              {...register('consent')}
            />
            <span className="text-xs text-surface-500 leading-relaxed">
              I agree to be contacted by Global Minds Academy via phone, email or WhatsApp for course-related enquiries.
              I have read and accept the{' '}
              <a href="/privacy-policy" className="text-brand-600 hover:underline">Privacy Policy</a>.
            </span>
          </label>
          {errors.consent && <p id="enq-consent-error" className="form-error">{errors.consent.message}</p>}
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Request Free Counseling
            </>
          )}
        </button>
      </form>
    </div>
  );
}
