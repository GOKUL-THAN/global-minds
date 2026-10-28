import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { HomeContactForm } from './HomeContactForm';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShinyText } from '../ui/ShinyText';

export function HomeContactSection() {
  const address = `${siteConfig.address.line1}, ${siteConfig.address.line2}`;

  return (
    <section className="home-contact section" aria-label="Contact Global Minds Academy">
      <div className="container-xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="home-section-kicker mb-3 text-sm font-bold uppercase tracking-wider">
              <ShinyText text="💬 Talk to our team" shinyColor="rgba(23, 108, 115, 0.9)" />
            </p>
            <h2 className="display-md text-surface-900">Have Questions? <span className="home-hero-highlight">Let&apos;s Talk Tech</span></h2>
            <p className="mt-4 max-w-xl leading-relaxed text-surface-700">
              Ask us about upcoming programs, training options, or enterprise learning. Our team can help you find the right next step.
            </p>

            <div className="mt-7 space-y-3">
              <SpotlightCard>
                <a className="home-contact-link flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 transition-colors" href={`mailto:${siteConfig.email}`}>
                  <span className="home-contact-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-surface-600">Email us</span>
                    <span className="block break-all text-sm font-bold text-surface-900">{siteConfig.email}</span>
                  </span>
                </a>
              </SpotlightCard>

              <SpotlightCard>
                <a className="home-contact-link flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 transition-colors" href={`tel:${siteConfig.phone}`}>
                  <span className="home-contact-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-surface-600">Call / WhatsApp</span>
                    <span className="block text-sm font-bold text-surface-900">{siteConfig.phone}</span>
                  </span>
                </a>
              </SpotlightCard>

              <SpotlightCard>
                <Link className="home-contact-link flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 transition-colors" to="/locations">
                  <span className="home-contact-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-surface-600">Visit our centre</span>
                    <span className="block text-sm font-bold text-surface-900">{address}</span>
                  </span>
                </Link>
              </SpotlightCard>
            </div>
          </div>

          <div className="home-contact-form">
            <SpotlightCard>
              <HomeContactForm />
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
