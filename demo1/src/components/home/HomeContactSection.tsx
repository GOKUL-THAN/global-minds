import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { EnquiryForm } from '../ui/EnquiryForm';

export function HomeContactSection() {
  const address = `${siteConfig.address.line1}, ${siteConfig.address.line2}`;

  return (
    <section className="home-contact section" aria-label="Contact Global Minds Academy">
      <div className="container-xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="home-section-kicker mb-3 text-sm font-semibold uppercase tracking-wider">Talk to our team</p>
            <h2 className="display-md text-surface-900">Have Questions? <span className="home-hero-highlight">Let&apos;s Talk Tech</span></h2>
            <p className="mt-4 max-w-xl leading-relaxed text-surface-600">
              Ask us about upcoming programs, training options, or enterprise learning. Our team can help you find the right next step.
            </p>

            <div className="mt-7 space-y-3">
              <a className="home-contact-link flex items-center gap-3 rounded-xl border p-4 transition-colors" href={`mailto:${siteConfig.email}`}>
                <span className="home-contact-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-surface-500">Email us</span>
                  <span className="block break-all text-sm font-semibold text-surface-800">{siteConfig.email}</span>
                </span>
              </a>
              <a className="home-contact-link flex items-center gap-3 rounded-xl border p-4 transition-colors" href={`tel:${siteConfig.phone}`}>
                <span className="home-contact-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-medium text-surface-500">Call / WhatsApp</span>
                  <span className="block text-sm font-semibold text-surface-800">{siteConfig.phone}</span>
                </span>
              </a>
              <Link className="home-contact-link flex items-center gap-3 rounded-xl border p-4 transition-colors" to="/locations">
                <span className="home-contact-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-medium text-surface-500">Visit our centre</span>
                  <span className="block text-sm font-semibold text-surface-800">{address}</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="home-contact-form rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
            <h3 className="font-display text-xl font-bold text-surface-900">Send Us a Message</h3>
            <p className="mt-1 text-sm text-surface-600">Share your question and tell us which course interests you.</p>
            <p className="mt-2 text-xs text-surface-500">Your enquiry is saved securely so our admissions team can follow up.</p>
            <EnquiryForm compact className="mt-5" title="" subtitle="" />
          </div>
        </div>
      </div>
    </section>
  );
}
