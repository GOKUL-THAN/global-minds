import { Award, BadgeCheck, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { ShinyText } from '../components/ui/ShinyText';
import { DecryptedText } from '../components/ui/DecryptedText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { TiltedCard } from '../components/ui/TiltedCard';

const certTypes = [
  { icon: BadgeCheck, title: 'Course Completion Certificate', desc: 'Issued upon completing any Global Minds Academy course or master program.', color: 'bg-brand-50 text-brand-600', href: '/courses' },
  { icon: Star, title: 'Project Certificate', desc: 'Awarded for successfully completing capstone and real-world projects.', color: 'bg-purple-50 text-purple-600', href: '/live-projects' },
  { icon: Award, title: 'Internship Certificate', desc: 'Certificate for completing an internship through Global Minds Academy\'s internship program.', color: 'bg-green-50 text-green-600', href: '/internships' },
  { icon: CheckCircle, title: 'Skill Certification', desc: 'Skill-specific certificates for assessed competency in a technology area.', color: 'bg-accent-50 text-accent-600', href: '/skill-assessment' },
];

const vendorCerts = [
  { name: 'AWS', credential: 'AWS Certified Solutions Architect – Associate', courses: ['AWS / Cloud', 'AWS DevOps', 'Cloud Master Program'], logo: 'aws', href: '/courses/aws-training' },
  { name: 'Microsoft', credential: 'Microsoft Certified: Azure Administrator Associate', courses: ['Azure Training', 'Cloud Master Program'], logo: 'microsoft', href: '/courses/microsoft-azure' },
  { name: 'Google Cloud', credential: 'Professional Cloud Architect', courses: ['GCP Training', 'Cloud Master Program'], logo: 'google-cloud', href: '/courses/google-cloud' },
  { name: 'Kubernetes', credential: 'Certified Kubernetes Administrator (CKA)', courses: ['Kubernetes', 'DevOps Master Program'], logo: 'kubernetes', href: '/courses/kubernetes' },
  { name: 'CompTIA', credential: 'CompTIA Security+', courses: ['Cyber Security'], logo: 'comptia', href: '/courses/comptia-security-plus' },
  { name: 'ISTQB', credential: 'Certified Tester Foundation Level (CTFL)', courses: ['Software Testing Master Program'], logo: 'istqb', href: '/courses/software-testing' },
  { name: 'Google', credential: 'Google Data Analytics Professional Certificate', courses: ['Data Analytics', 'Data Science'], logo: 'google', href: '/courses/data-analytics' },
  { name: 'HashiCorp', credential: 'HashiCorp Certified: Terraform Associate', courses: ['DevOps Training', 'Cloud Master Program'], logo: 'hashicorp', href: '/courses/terraform' },
];

export default function CertificationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16 relative overflow-hidden">
        <div className="container-xl relative z-10 grid lg:grid-cols-[1fr_0.8fr] items-center gap-10">
          <div>
            <Breadcrumbs items={[{ label: 'Certifications' }]} className="mb-4" />
            <div className="page-hero-badge mb-4">
              <ShinyText text="Industry Recognized Credentials" shinyColor="rgba(23, 108, 115, 0.9)" />
            </div>
            <h1 className="page-hero-title mb-4">
              Global <DecryptedText text="Certifications" speed={30} maxIterations={10} className="page-hero-highlight" />
            </h1>
            <p className="page-hero-desc text-xl max-w-2xl leading-relaxed">
              Earn industry-recognised certificates that validate your skills and boost your career profile.
            </p>
            <p className="text-surface-600 text-sm mt-4 font-medium">
              * Accreditation details and verifiable credentials included with every program.
            </p>
          </div>
          <div className="relative">
            <TiltedCard>
              <img
                src="/images/certificate-illustration.svg"
                alt="Illustration of a course completion certificate"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-xl border border-teal-200/60"
              />
            </TiltedCard>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <h2 className="display-md text-center mb-4">Global Minds Academy Certificates</h2>
          <p className="text-surface-600 font-medium text-center mb-12 max-w-xl mx-auto">
            Every learner who completes a Global Minds Academy course receives a certificate. Additional certificates are available for projects and internships.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certTypes.map(cert => (
              <SpotlightCard key={cert.title} className="h-full">
                <Link to={cert.href} className="block p-6 rounded-2xl border border-surface-200 bg-white hover:border-brand-300 hover:shadow-card-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 h-full flex flex-col justify-between" aria-label={`Explore ${cert.title}`}>
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${cert.color}`}>
                      <cert.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-surface-900 mb-2">{cert.title}</h3>
                    <p className="text-surface-600 text-sm leading-relaxed">{cert.desc}</p>
                  </div>
                </Link>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <h2 className="display-md text-center mb-4">Vendor Certification Preparation</h2>
          <p className="text-surface-600 font-medium text-center mb-12 max-w-xl mx-auto">
            Explore preparation for these official vendor credentials. Select a card to view the related academy course; vendor exams and credentials are provided by their respective organisations.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendorCerts.map(cert => (
              <SpotlightCard key={cert.name} className="h-full">
                <Link to={cert.href} className="block bg-white rounded-2xl p-5 border border-surface-200 hover:border-brand-300 hover:shadow-card hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 h-full flex flex-col justify-between" aria-label={`Explore ${cert.credential} preparation course`}>
                  <div>
                    <div className="h-14 flex items-center mb-4">
                      <img
                        src={`/images/certification-vendors/${cert.logo}.png`}
                        alt={`${cert.name} logo`}
                        className="max-w-32 max-h-12 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-brand-700 font-bold uppercase tracking-wide mb-1">{cert.name} certification</p>
                    <h3 className="font-semibold text-surface-900 mb-3">{cert.credential}</h3>
                  </div>
                  <ul className="space-y-1 pt-2 border-t border-surface-100">
                    {cert.courses.map(c => (
                      <li key={c} className="text-xs text-surface-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />{c}
                      </li>
                    ))}
                  </ul>
                </Link>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Get Certified with Global Minds Academy"
        subtitle="Start your certification journey today with expert-led training and practical projects."
        primaryLabel="Browse Courses"
        primaryHref="/courses"
        secondaryLabel="Talk to Counselor"
        secondaryHref="/contact"
      />
    </div>
  );
}
