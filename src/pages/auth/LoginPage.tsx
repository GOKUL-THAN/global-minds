import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';
import { authService } from '../../services/authService';
import { siteConfig } from '../../data/siteConfig';
import { cn } from '../../utils/cn';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const adminLogin = location.pathname === '/admin/login';

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [notice, setNotice] = useState('');
  const [isResending, setIsResending] = useState(false);

  const onSubmit = async (data: FormData) => {
    setError('');
    setNotice('');
    try {
      const result = await authService.login(data);
      if (result.success) {
        if (!result.user) {
          setError('Unable to verify your account.');
          return;
        }
        if (result.user.role === 'STUDENT') {
          navigate('/dashboard', { replace: true });
          return;
        }
        if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER', 'TRAINER'].includes(result.user.role)) {
          setError('This account is not authorized to access the admin portal.');
          return;
        }
        navigate('/admin', { replace: true });
      } else {
        setError(result.message);
        if (result.code === 'EMAIL_VERIFICATION_REQUIRED') {
          setNotice('Your email address must be verified before you can sign in.');
        }
      }
    } catch {
      setError('Unable to reach the sign-in server. Start the API server and try again.');
    }
  };

  const resendVerification = async () => {
    const email = getValues('email');
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setError('');
    setIsResending(true);
    try {
      const result = await authService.resendVerification(email);
      setNotice(result.message);
      if (!result.success) setError(result.message);
    } catch {
      setError('We could not resend the verification link right now.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <SpotlightCard className="bg-white rounded-3xl p-8 max-w-md w-full shadow-card-xl border border-surface-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold mb-4">
            <ShinyText text="🛡️ Secure Portal Sign-In" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <Link to="/" className="inline-flex items-center gap-2 mb-4 block">
            <img src={siteConfig.logoUrl} alt="Global Minds Academy logo" className="h-20 w-20 object-contain mx-auto" />
          </Link>
          <h1 className="font-display font-bold text-2xl">{adminLogin ? 'Admin sign in' : 'Sign in'}</h1>
          <p className="text-surface-600 font-medium mt-1 text-sm">
            {adminLogin ? 'Sign in with your Admin or Super Admin account.' : 'Sign in to your student or admin account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" placeholder="your@email.com" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'login-email-error' : undefined} className={cn('form-input', errors.email && 'border-red-400')} {...register('email')} />
            {errors.email && <p id="login-email-error" className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label mb-0" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-700 hover:text-brand-800">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                className={cn('form-input pr-10', errors.password && 'border-red-400')}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-800"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p id="login-password-error" className="form-error">{errors.password.message}</p>}
          </div>

          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
          {notice && <p role="status" className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">{notice}</p>}
          {notice && (
            <button type="button" disabled={isResending} onClick={() => void resendVerification()} className="text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50">
              {isResending ? 'Sending verification link...' : 'Resend verification email'}
            </button>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary btn w-full">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>

          <div className="pt-4 border-t border-surface-200 space-y-2">
            <p className="text-center text-xs text-surface-500 font-medium">Quick One-Click Demo Access:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void onSubmit({ email: 'student@globalminds.com', password: 'StudentDemoPassword123!' });
                }}
                className="text-xs py-2 px-3 rounded-xl border border-brand-200 bg-brand-50 text-brand-800 font-semibold hover:bg-brand-100 transition-colors text-center"
              >
                🎓 Demo Student
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void onSubmit({ email: 'admin@local.test', password: 'AdminDemoPassword123!' });
                }}
                className="text-xs py-2 px-3 rounded-xl border border-surface-300 bg-surface-100 text-surface-800 font-semibold hover:bg-surface-200 transition-colors text-center"
              >
                🛡️ Demo Admin
              </button>
            </div>
          </div>
        </form>

        {!adminLogin && (
          <p className="text-center text-sm text-surface-600 font-medium mt-6">
            New to Global Minds Academy? <Link to="/register" className="text-brand-700 hover:text-brand-800 font-bold">Create an account</Link>
          </p>
        )}
        <p className="text-center text-xs mt-4"><Link to="/" className="text-surface-600 hover:text-brand-700 font-medium">Back to website</Link></p>
      </SpotlightCard>
    </div>
  );
}
