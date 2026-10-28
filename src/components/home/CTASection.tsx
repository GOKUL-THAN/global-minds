import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { siteConfig } from '../../data/siteConfig';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  showPhone?: boolean;
  variant?: 'brand' | 'dark' | 'light';
}

export function CTASection({
  title = 'Ready to Start Your Journey?',
  subtitle = 'Get free career counseling. Our experts will guide you to the right course and career path.',
  primaryLabel = 'Enroll Now',
  primaryHref = '/register',
  secondaryLabel = 'Contact Us',
  secondaryHref = '/contact',
  showPhone = true,
  variant = 'brand',
}: CTASectionProps) {
  const bg =
    variant === 'brand'
      ? 'cta-section-banner bg-gradient-to-r from-brand-800 to-brand-700'
      : variant === 'dark'
      ? 'cta-section-banner bg-surface-950'
      : 'bg-surface-50';
  const textPrimary = variant === 'light' ? 'text-surface-900 font-extrabold' : 'text-white font-extrabold';
  const textSecondary = variant === 'light' ? 'text-surface-600' : 'text-white/90';

  return (
    <section className={`${bg} relative overflow-hidden py-20`} aria-label="Call to action">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="container-xl relative text-center">
        <h2 className={`display-md mb-4 ${textPrimary}`}>{title}</h2>
        <p className={`text-lg mb-10 max-w-2xl mx-auto leading-relaxed ${textSecondary}`}>{subtitle}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={primaryHref}>
            <Button
              size="xl"
              className={variant !== 'light' ? 'bg-white text-brand-900 hover:bg-brand-50 shadow-lg font-bold' : ''}
              variant={variant === 'light' ? 'primary' : 'ghost'}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {primaryLabel}
            </Button>
          </Link>
          <Link to={secondaryHref}>
            <Button
              size="xl"
              className={variant !== 'light' ? 'border-2 border-white/80 text-white hover:bg-white/10 font-bold' : ''}
              variant={variant === 'light' ? 'secondary' : 'outline'}
            >
              {secondaryLabel}
            </Button>
          </Link>
        </div>

        {showPhone && (
          <div className="mt-8">
            <a
              href={`tel:${siteConfig.phone}`}
              className={`inline-flex items-center gap-2 text-sm font-semibold ${textSecondary} hover:${textPrimary} transition-colors`}
            >
              <Phone className="w-4 h-4" />
              Call us: {siteConfig.phone}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
