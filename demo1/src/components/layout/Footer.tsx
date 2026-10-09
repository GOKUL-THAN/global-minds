import { Link } from 'react-router-dom';
import {
  GraduationCap, Mail, Phone, MapPin, Facebook, Twitter,
  Linkedin, Youtube, Instagram, Github, Send,
} from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { useState } from 'react';
import { enquiryService } from '../../services/enquiryService';
import { cn } from '../../utils/cn';

const footerLinks = {
  Courses: [
    { label: 'AWS Training', href: '/courses/aws-training' },
    { label: 'DevOps Training', href: '/courses/devops-training' },
    { label: 'Data Science', href: '/courses/data-science' },
    { label: 'Full Stack Development', href: '/courses/full-stack-development' },
    { label: 'Generative AI', href: '/courses/generative-ai' },
    { label: 'Cyber Security', href: '/courses/cyber-security' },
    { label: 'Python Training', href: '/courses/python-training' },
    { label: 'All Courses', href: '/courses' },
  ],
  'Master Programs': [
    { label: 'Freshers Program', href: '/master-programs/freshers-master-program' },
    { label: 'Full Stack', href: '/master-programs/full-stack-master-program' },
    { label: 'Cloud Program', href: '/master-programs/cloud-master-program' },
    { label: 'DevOps Program', href: '/master-programs/devops-master-program' },
    { label: 'Data Science & AI', href: '/master-programs/data-science-master-program' },
    { label: 'Software Testing', href: '/master-programs/software-testing-master-program' },
    { label: 'All Programs', href: '/master-programs' },
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
  'Popular New Courses': [
    { label: 'CCNA Training', href: '/courses/ccna' },
    { label: 'SAP ABAP', href: '/courses/sap-abap' },
    { label: 'SAP FICO', href: '/courses/sap-fico' },
    { label: 'ServiceNow', href: '/courses/servicenow' },
    { label: '.NET Core / C#', href: '/courses/dotnet-core' },
    { label: 'Snowflake', href: '/courses/snowflake' },
    { label: 'dbt', href: '/courses/dbt' },
    { label: 'Databricks', href: '/courses/databricks' },
    { label: 'Flutter', href: '/courses/flutter' },
    { label: 'PMP Certification', href: '/courses/pmp-certification' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Expert Trainers', href: '/trainers' },
    { label: 'Locations', href: '/locations' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: siteConfig.socialLinks.linkedin, label: 'LinkedIn' },
  { icon: Youtube, href: siteConfig.socialLinks.youtube, label: 'YouTube' },
  { icon: Instagram, href: siteConfig.socialLinks.instagram, label: 'Instagram' },
  { icon: Facebook, href: siteConfig.socialLinks.facebook, label: 'Facebook' },
  { icon: Twitter, href: siteConfig.socialLinks.twitter, label: 'X (Twitter)' },
  { icon: Github, href: siteConfig.socialLinks.github, label: 'GitHub' },
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
    <footer className="bg-surface-950 text-surface-300">
      {/* Main Footer */}
      <div className="container-xl pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                Global <span className="text-brand-400">Minds Academy</span>
              </span>
            </Link>

            <p className="text-sm text-surface-400 leading-relaxed mb-6 max-w-xs">
              {siteConfig.subTagline}
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-6">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                {siteConfig.phone}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                {siteConfig.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="text-surface-400">
                  {siteConfig.address.city}, {siteConfig.address.state}, {siteConfig.address.country}
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    'w-9 h-9 rounded-xl bg-surface-800 hover:bg-brand-600',
                    'flex items-center justify-center text-surface-400 hover:text-white',
                    'transition-all duration-200',
                  )}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="font-semibold text-white text-sm mb-4">{group}</h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-surface-400 hover:text-white hover:translate-x-0.5 transition-all duration-200 inline-block"
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
        <div className="mt-12 pt-10 border-t border-surface-800">
          <div className="max-w-xl">
            <h3 className="font-display font-bold text-white text-lg mb-2">
              Stay ahead with industry insights
            </h3>
            <p className="text-sm text-surface-400 mb-4">
              Get the latest on courses, certifications, tech trends and career tips.
            </p>

            {subscribed ? (
              <p className="text-green-400 text-sm font-medium">
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
                    'flex-1 px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700',
                    'text-white placeholder-surface-500 text-sm',
                    'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
                  )}
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:block">Subscribe</span>
                </button>
              </form>
            )}
            {subscribeError && <p role="alert" className="text-red-300 text-sm mt-2">{subscribeError}</p>}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <div className="container-xl py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500 text-center sm:text-left">
            © {new Date().getFullYear()} Global Minds Academy. All rights reserved.{' '}
            <span className="text-surface-600">Placeholder content — business details to be updated.</span>
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
                className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
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
