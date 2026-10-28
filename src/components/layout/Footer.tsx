import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter,
  Linkedin, Youtube, Instagram, Github, Send,
} from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { useState } from 'react';
import { enquiryService } from '../../services/enquiryService';
import { cn } from '../../utils/cn';
import { Magnetic } from '../ui/Magnetic';
import { ShinyText } from '../ui/ShinyText';

const footerLinks = {
  Courses: [
    { label: 'AWS / Cloud', href: '/courses/aws-training' },
    { label: 'Data Science', href: '/courses/data-science' },
    { label: 'Machine Learning', href: '/courses/machine-learning' },
    { label: 'Full Stack Development', href: '/courses/full-stack-development' },
    { label: 'Cyber Security', href: '/courses/cyber-security' },
    { label: 'Software Testing', href: '/courses/software-testing' },
    { label: 'Automation Testing', href: '/courses/automation-testing' },
    { label: 'All Courses', href: '/courses' },
  ],
  'Training & Learning': [
    { label: 'Online Training', href: '/online-training' },
    { label: 'Classroom Training', href: '/classroom-training' },
    { label: 'Batch Schedule', href: '/batch-schedule' },
    { label: 'Free Demo Class', href: '/demo-class' },
    { label: 'Live Projects', href: '/live-projects' },
    { label: 'Skill Assessment', href: '/skill-assessment' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'Corporate Training', href: '/corporate-training' },
    { label: 'Internships', href: '/internships' },
  ],
  'Career & Offers': [
    { label: 'Career Support', href: '/career' },
    { label: 'Placement Records', href: '/placement-records' },
    { label: 'Job Support', href: '/job-support' },
    { label: 'Interview Prep', href: '/career/interview-preparation' },
    { label: 'Resume Prep', href: '/career/resume-preparation' },
    { label: 'Mock Interview', href: '/career/mock-interview' },
    { label: 'Events & Webinars', href: '/events' },
    { label: 'Scholarships', href: '/scholarships' },
    { label: 'Refer & Earn', href: '/refer-earn' },
  ],

  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Locations', href: '/locations' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: siteConfig.socialLinks.linkedin, label: 'LinkedIn', color: '#0A66C2' },
  { icon: Youtube, href: siteConfig.socialLinks.youtube, label: 'YouTube', color: '#FF0000' },
  { icon: Instagram, href: siteConfig.socialLinks.instagram, label: 'Instagram', color: '#E4405F' },
  { icon: Facebook, href: siteConfig.socialLinks.facebook, label: 'Facebook', color: '#1877F2' },
  { icon: Twitter, href: siteConfig.socialLinks.twitter, label: 'X (Twitter)', color: '#000000' },
  { icon: Github, href: siteConfig.socialLinks.github, label: 'GitHub', color: '#181717' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeError('');
    setLoading(true);
    try {
      const result = await enquiryService.subscribeNewsletter(email);
      if (result.success) setSubscribed(true);
      else setSubscribeError(result.message);
    } catch {
      setSubscribeError('Unable to subscribe right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white text-surface-700 border-t border-surface-200">
      {/* Main Footer */}
      <div className="container-xl pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.png"
                alt="Global Minds Academy logo"
                className="h-12 w-12 object-contain rounded-xl bg-surface-50 border border-surface-200 p-1"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="font-display font-extrabold text-xl text-surface-900">
                Global <span className="text-brand-600">Minds Academy</span>
              </span>
            </Link>

            <p className="text-sm text-surface-600 leading-relaxed mb-6 max-w-xs">
              {siteConfig.subTagline}
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-6">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-2.5 text-sm text-surface-700 hover:text-brand-700 transition-colors font-medium"
              >
                <Phone className="w-4 h-4 text-brand-600 flex-shrink-0" />
                {siteConfig.phone}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2.5 text-sm text-surface-700 hover:text-brand-700 transition-colors font-medium"
              >
                <Mail className="w-4 h-4 text-brand-600 flex-shrink-0" />
                {siteConfig.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-surface-600">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>
                  {siteConfig.address.city}, {siteConfig.address.state}, {siteConfig.address.country}
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <Magnetic key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="footer-social-link group w-9 h-9 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300 flex items-center justify-center transition-all duration-200 shadow-sm"
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="footer-link-group">
              <h3 className="mb-4 hidden text-sm font-bold text-surface-900 lg:block">{group}</h3>
              <details className="lg:hidden">
                <summary className="cursor-pointer py-3 text-sm font-bold text-surface-900">{group}</summary>
                <ul className="space-y-2.5 pb-3">
                  {links.map(link => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-surface-600 hover:text-brand-700 hover:translate-x-0.5 transition-all duration-200 inline-block font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
              <ul className="hidden space-y-2.5 lg:block">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-surface-600 hover:text-brand-700 hover:translate-x-0.5 transition-all duration-200 inline-block font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-surface-200">
          <div className="max-w-xl">
            <h3 className="font-display font-bold text-surface-900 text-lg mb-2">
              Stay ahead with industry insights
            </h3>
            <p className="text-sm text-surface-600 mb-4">
              Get the latest on courses, certifications, tech trends and career tips.
            </p>

            {subscribed ? (
              <p className="text-green-700 text-sm font-semibold">
                ✓ You're subscribed! Thank you.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl bg-white border border-surface-300',
                    'text-surface-900 placeholder:text-surface-400 text-sm',
                    'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
                  )}
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:block">
                    <ShinyText text="Subscribe" shinyColor="rgba(255, 255, 255, 0.95)" />
                  </span>
                </button>
              </form>
            )}
            {subscribeError && <p role="alert" className="text-red-600 text-sm mt-2">{subscribeError}</p>}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-200">
        <div className="container-xl py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600 text-center sm:text-left font-medium">
            © {new Date().getFullYear()} Global Minds Academy. All rights reserved.
          </p>

          <div className="flex items-center flex-wrap justify-center gap-4">
            {[
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Refund Policy', href: '/refund-policy' },
              { label: 'Cookie Policy', href: '/cookie-policy' },
            ].map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-xs text-surface-600 hover:text-brand-700 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
