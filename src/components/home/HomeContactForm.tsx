import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import { cn } from '../../utils/cn';

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function HomeContactForm() {
  const [success, setSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: 'Course Enrollment' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmissionError('');
    try {
      const result = await enquiryService.submitContact({
        ...data,
        message: data.message ?? '',
      });
      if (!result.success) {
        setSubmissionError(result.message);
        return;
      }
      setSuccess(true);
      reset({ subject: 'Course Enrollment' });
    } catch (cause) {
      setSubmissionError(cause instanceof Error ? cause.message : 'Unable to submit your enquiry. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-sm sm:p-8" role="status">
        <h3 className="font-display text-xl font-bold text-surface-900">Thank you for your enquiry!</h3>
        <p className="mt-2 text-sm text-surface-600">Our admissions team will be in touch soon.</p>
        <button type="button" onClick={() => setSuccess(false)} className="mt-4 text-sm font-semibold text-brand-700 hover:underline">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-surface-900">Send Us a Message</h3>
        <p className="mt-3 text-surface-600 leading-relaxed">
          Have questions about our bootcamps, fees, or batch timings? Drop us a message!
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="form-label" htmlFor="home-enq-name">Full Name *</label>
          <input
            id="home-enq-name"
            type="text"
            autoComplete="name"
            placeholder="Name"
            className={cn('form-input', errors.fullName && 'border-red-400')}
            aria-invalid={!!errors.fullName}
            {...register('fullName')}
          />
          {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="home-enq-email">Email Address *</label>
            <input
              id="home-enq-email"
              type="email"
              autoComplete="email"
              placeholder="your email ID"
              className={cn('form-input', errors.email && 'border-red-400')}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="home-enq-phone">Phone / WhatsApp *</label>
            <input
              id="home-enq-phone"
              type="tel"
              autoComplete="tel"
              placeholder="10-digit Mobile Number"
              className={cn('form-input', errors.phone && 'border-red-400')}
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="home-enq-subject">Subject</label>
          <select id="home-enq-subject" className={cn('form-select', errors.subject && 'border-red-400')} {...register('subject')}>
            <option value="Course Enrollment">Course Enrollment</option>
            <option value="Fees">Fees</option>
            <option value="Batch Timings">Batch Timings</option>
            <option value="Other">Other</option>
          </select>
          {errors.subject && <p className="form-error">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="form-label" htmlFor="home-enq-message">Your Message / Requirements</label>
          <textarea
            id="home-enq-message"
            rows={4}
            placeholder="Tell us about your learning goals or software requirements..."
            className="form-input resize-y"
            {...register('message')}
          />
        </div>

        {submissionError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submissionError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn w-full !rounded-full bg-amber-400 text-brand-950 shadow-md hover:bg-amber-500 active:bg-amber-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Enquiry <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
