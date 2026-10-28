import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { siteConfig } from '../data/siteConfig';
import { cn } from '../utils/cn';
import { useCourseCatalog } from '../hooks/useCourseCatalog';

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  country: z.string().min(1, 'Country required'),
  city: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  interestedCourse: z.string().optional(),
  mode: z.string().optional(),
  careerGoal: z.string().optional(),
  consent: z.boolean().refine(v => v, 'You must agree to the terms'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { courses, loading: coursesLoading, error: coursesError } = useCourseCatalog();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const result = await authService.register({ ...data, city: data.city ?? '' });
      if (result.success) setSuccess(true);
      else setError(result.message);
    } catch {
      setError('We could not create your account right now. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-card-xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Account created — verification pending</h2>
          <p className="text-surface-500 mb-6">
            Your account is ready. Check your inbox for a verification link before signing in. The link expires after one hour.
          </p>
          <p className="text-sm text-surface-500 mb-6">
            Didn’t receive the email? <Link to="/login" className="text-brand-600 hover:underline">Sign in and request another verification link.</Link>
          </p>
          <Link to="/courses" className="btn-primary btn w-full justify-center">Explore Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-card-xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src={siteConfig.logoUrl} alt="Global Minds Academy logo" className="h-20 w-20 object-contain" />
          </Link>
          <h1 className="font-display font-bold text-2xl">Create Your Account</h1>
          <p className="text-surface-600 font-medium mt-1">Join Global Minds Academy and start your learning journey.</p>
          <p className="text-xs text-surface-600 font-medium mt-1">Student accounts require email verification before sign-in.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input type="text" placeholder="Your full name" className={cn('form-input', errors.fullName && 'border-red-400')} autoComplete="name" {...register('fullName')} />
              {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input type="email" placeholder="your@email.com" className={cn('form-input', errors.email && 'border-red-400')} autoComplete="email" {...register('email')} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone *</label>
              <input type="tel" placeholder="+91 99999 00000" className={cn('form-input', errors.phone && 'border-red-400')} autoComplete="tel" {...register('phone')} />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="form-label">Password *</label>
              <input type="password" placeholder="Min. 12 characters" className={cn('form-input', errors.password && 'border-red-400')} autoComplete="new-password" {...register('password')} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Country *</label>
              <select className="form-select" {...register('country')}>
                <option value="">Select country</option>
                {siteConfig.countries.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
              {errors.country && <p className="form-error">{errors.country.message}</p>}
            </div>
            <div>
              <label className="form-label">City</label>
              <input type="text" placeholder="Your city" className="form-input" {...register('city')} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Education</label>
              <select className="form-select" {...register('education')}>
                <option value="">Select education</option>
                <option>10th / Secondary</option>
                <option>12th / Higher Secondary</option>
                <option>Diploma</option>
                <option>Bachelor's Degree</option>
                <option>Master's Degree</option>
                <option>PhD</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Experience</label>
              <select className="form-select" {...register('experience')}>
                <option value="">Select experience</option>
                <option>Fresher / Student</option>
                <option>Less than 1 year</option>
                <option>1–3 years</option>
                <option>3–5 years</option>
                <option>5–10 years</option>
                <option>10+ years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Interested Course</label>
            <select className="form-select" {...register('interestedCourse')}>
              <option value="">Select a course</option>
              {courses.map(course => <option key={course.id} value={course.title}>{course.title}</option>)}
            </select>
            {coursesError && <p className="mt-1 text-xs text-surface-500">Course options are temporarily unavailable.</p>}
            {coursesLoading && <p className="mt-1 text-xs text-surface-500">Loading course options…</p>}
          </div>

          <div>
            <label className="form-label">Preferred Learning Mode</label>
            <select className="form-select" {...register('mode')}>
              <option value="">Select mode</option>
              <option>Online</option>
              <option>Classroom</option>
              <option>One-to-One</option>
            </select>
          </div>

          <div>
            <label className="form-label">Career Goal</label>
            <input type="text" placeholder="e.g. Become a Cloud Engineer, Switch to Data Science..." className="form-input" {...register('careerGoal')} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-brand-600 rounded border-surface-300" {...register('consent')} />
            <span className="text-xs text-surface-600 font-medium">
              I agree to the{' '}
              <Link to="/terms" className="text-brand-700 font-bold hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-brand-700 font-bold hover:underline">Privacy Policy</Link>,
              and consent to being contacted by Global Minds Academy.
            </span>
          </label>
          {errors.consent && <p className="form-error">{errors.consent.message}</p>}

          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary btn w-full">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-surface-600 font-medium mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 hover:text-brand-800 font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
