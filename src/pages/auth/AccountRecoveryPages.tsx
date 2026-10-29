import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { siteConfig } from '../../data/siteConfig';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

function AuthPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <SpotlightCard className="max-w-md w-full">
        <section className="bg-white rounded-3xl p-8 w-full shadow-card-xl border border-surface-200">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4" aria-label="Global Minds Technologies home">
              <img src={siteConfig.logoUrl} alt="Global Minds Technologies logo" className="h-20 w-20 object-contain" />
            </Link>
            <h1 className="font-display font-bold text-2xl">
              <ShinyText text={title} shinyColor="rgba(23, 108, 115, 0.9)" />
            </h1>
          </div>
          {children}
        </section>
      </SpotlightCard>
    </main>
  );
}

function StatusMessage({ error, message }: { error: string; message: string }) {
  if (error) return <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>;
  if (message) return <p role="status" className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{message}</p>;
  return null;
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') ?? '').trim();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!token) {
      setError('This verification link is invalid or missing its token.');
      setLoading(false);
      return () => { active = false; };
    }
    void authService.verifyEmail(token)
      .then(result => {
        if (!active) return;
        if (result.success) setMessage(result.message);
        else setError(result.message);
      })
      .catch(() => {
        if (active) setError('We could not verify this email right now. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  return (
    <AuthPageShell title="Verify your email">
      <div className="space-y-5 text-center">
        {loading
          ? <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          : message && <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />}
        <StatusMessage error={error} message={message} />
        {!loading && (
          <Link to="/login" className="btn-primary btn w-full justify-center">
            {message ? 'Continue to sign in' : 'Go to sign in'}
          </Link>
        )}
      </div>
    </AuthPageShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    setError('');
    setMessage('');
    if (!normalizedEmail) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.forgotPassword(normalizedEmail);
      if (result.success) setMessage(result.message);
      else setError(result.message);
    } catch {
      setError('We could not request a password reset right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Reset your password">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-surface-600 font-medium">Enter your account email. If an active account exists, we’ll send a time-limited reset link.</p>
        <div>
          <label className="form-label" htmlFor="recovery-email">Email</label>
          <input id="recovery-email" className="form-input" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
        </div>
        <StatusMessage error={error} message={message} />
        <button className="btn-primary btn w-full justify-center" type="submit" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send reset link'}
        </button>
        <p className="text-center text-sm"><Link to="/login" className="text-brand-700 font-semibold hover:underline">Back to sign in</Link></p>
      </form>
    </AuthPageShell>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = (searchParams.get('token') ?? '').trim();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState(token ? '' : 'This password reset link is invalid or missing its token.');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!token) {
      setError('This password reset link is invalid or missing its token.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.resetPassword(token, password);
      if (result.success) {
        setMessage(result.message);
        window.setTimeout(() => navigate('/login', { replace: true }), 1500);
      } else {
        setError(result.message);
      }
    } catch {
      setError('We could not reset your password right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-surface-600 font-medium">Use a password at least 12 characters long. Reset links expire after 30 minutes.</p>
        <div>
          <label className="form-label" htmlFor="new-password">New password</label>
          <input id="new-password" className="form-input" type="password" autoComplete="new-password" minLength={12} maxLength={72} required disabled={!token} value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        <div>
          <label className="form-label" htmlFor="confirm-password">Confirm password</label>
          <input id="confirm-password" className="form-input" type="password" autoComplete="new-password" minLength={12} maxLength={72} required disabled={!token} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
        </div>
        <StatusMessage error={error} message={message} />
        <button className="btn-primary btn w-full justify-center" type="submit" disabled={loading || !token}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update password'}
        </button>
      </form>
    </AuthPageShell>
  );
}
