import { Link } from 'react-router-dom';
import { FileText, Linkedin, Github, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CTASection } from '../../components/home/CTASection';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ComparisonSlider } from '../../components/ui/ComparisonSlider';

const resumeTips = [
  'Use a clean, ATS-friendly template with clear section headings',
  'Quantify achievements — use numbers and impact statements',
  'Tailor each resume to the specific job description',
  'Include a strong technical skills section relevant to the role',
  'Lead with your strongest experience or projects',
  'Keep it to 1–2 pages maximum',
  'Include links to your GitHub portfolio and LinkedIn profile',
  'Proofread carefully — one error can cost an interview',
];

const sections = [
  { title: 'Professional Summary', desc: 'A 2–3 sentence summary tailored to the target role that immediately communicates your value.' },
  { title: 'Technical Skills', desc: 'Clearly organised skills section — languages, frameworks, tools, cloud platforms, certifications.' },
  { title: 'Work Experience', desc: 'Role-based experience with bullet points using action verbs and quantified achievements.' },
  { title: 'Projects', desc: 'Real-world projects with tech stack, your contribution, and measurable outcomes.' },
  { title: 'Education & Certifications', desc: 'Degrees, relevant certifications (AWS, Azure, ISTQB etc.) and training completed.' },
  { title: 'Links', desc: 'GitHub portfolio, LinkedIn profile, personal website, deployed project URLs.' },
];

export default function ResumePrepPage() {
  usePageMeta({
    title: 'Resume Preparation & ATS Optimisation',
    description: 'Build an ATS-friendly, recruiter-ready IT resume with Global Minds Academy career support — tailored to your target role.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16">
        <div className="container-xl relative z-10">
          <Breadcrumbs
            items={[{ label: 'Career', href: '/career' }, { label: 'Resume Preparation' }]}
            className="mb-4"
          />
          <div className="page-hero-badge mb-4">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <ShinyText text="ATS-Friendly Formatting" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="page-hero-title display-lg font-extrabold mb-4">
            Resume <DecryptedText text="Preparation" speed={30} maxIterations={10} className="page-hero-highlight" />
          </h1>
          <p className="page-hero-desc text-lg sm:text-xl max-w-2xl">
            Build a strong, ATS-optimised resume that gets you shortlisted by top tech recruiters and hiring managers in the IT industry.
          </p>
        </div>
      </div>

      {/* Resume sections */}
      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-md mb-4">Key Resume Sections</h2>
            <p className="text-surface-600 max-w-xl mx-auto font-medium">
              A strong IT resume needs the right structure. Here's what every section should accomplish.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((s, i) => (
              <SpotlightCard key={s.title} className="h-full">
                <div className="p-6 rounded-2xl border border-surface-200 bg-white hover:border-brand-300 hover:shadow-card-md transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                      <span className="font-bold text-brand-600 text-sm">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="font-semibold text-surface-900 mb-2">{s.title}</h3>
                    <p className="text-surface-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>

          {/* Interactive ATS Transformation Comparison Slider (React Bits Pro UI & Cards) */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 mb-2">
                <ShinyText text="⚡ Interactive ATS Transformation" shinyColor="rgba(23, 108, 115, 0.95)" />
              </span>
              <h2 className="display-md text-surface-900">Drag to Compare: Traditional vs. Global Minds Resume</h2>
              <p className="text-surface-600 max-w-xl mx-auto mt-2 text-sm font-medium">
                See how our 1-on-1 resume engineering elevates your profile from ATS rejection to high-conversion tech interview calls.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ComparisonSlider
                beforeLabel="Standard Resume · 41% ATS"
                afterLabel="Global Minds Optimized · 98% ATS"
                beforeContent={
                  <div className="space-y-4 font-mono text-xs text-surface-300">
                    <div className="border-b border-surface-700 pb-2">
                      <p className="font-bold text-sm text-red-400">❌ Rahul Sharma — Software Developer</p>
                      <p className="text-surface-400">rahul@example.com · Chennai</p>
                    </div>
                    <div>
                      <p className="font-bold text-surface-200 mb-1">SUMMARY</p>
                      <p className="leading-relaxed">Hard working developer looking for a challenging role in IT company to utilize my skills and learn new technologies.</p>
                    </div>
                    <div>
                      <p className="font-bold text-surface-200 mb-1">SKILLS</p>
                      <p>Java, HTML, CSS, JavaScript, SQL, Basics of AWS, MS Office.</p>
                    </div>
                    <div>
                      <p className="font-bold text-surface-200 mb-1">EXPERIENCE / PROJECTS</p>
                      <p className="text-surface-300">• Worked on college library project using Java.</p>
                      <p className="text-surface-300">• Responsible for coding modules and bug fixing.</p>
                      <p className="text-surface-300">• Created forms and database tables.</p>
                    </div>
                  </div>
                }
                afterContent={
                  <div className="space-y-4 font-mono text-xs text-emerald-200">
                    <div className="border-b border-teal-800 pb-2 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-emerald-400">✅ Rahul Sharma — Cloud & Full Stack Engineer</p>
                        <p className="text-teal-300/80">rahul.dev@globalminds.org · github.com/rahul-cloud · LinkedIn Verified</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                        98% Recruiter Match
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-white mb-1">PROFESSIONAL SUMMARY</p>
                      <p className="leading-relaxed text-surface-200">Cloud-native Software Engineer trained at Global Minds Academy with hands-on mastery in AWS architecture, Spring Boot microservices, and React. Architected 3 production-grade capstones with 99.9% uptime SLA.</p>
                    </div>
                    <div>
                      <p className="font-bold text-white mb-1">CORE COMPETENCIES</p>
                      <p className="text-teal-200">AWS (ECS, S3, RDS, Lambda, Terraform, CloudWatch), Java 21, Spring Boot 3, React 19, TypeScript, PostgreSQL, Docker, CI/CD Jenkins pipeline.</p>
                    </div>
                    <div>
                      <p className="font-bold text-white mb-1">FEATURED CAPSTONE ARCHITECTURE</p>
                      <p className="text-surface-200">• <span className="font-bold text-teal-300">Scalable E-Commerce Microservices:</span> Deployed on AWS ECS with Docker & Terraform, reducing latency by 42%.</p>
                      <p className="text-surface-200">• <span className="font-bold text-teal-300">Automated CI/CD Pipeline:</span> Configured GitHub Actions & SonarQube quality gate ensuring 0 security vulnerabilities.</p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tips + Profile */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Tips */}
            <div>
              <h2 className="display-md mb-6">Resume Tips</h2>
              <ul className="space-y-3">
                {resumeTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-800 text-sm font-medium">{tip}</span>
                  </li>
                ))}
              </ul>

              {/* Profile links */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-surface-900">Build Your Online Presence</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-surface-200 flex-1">
                    <Linkedin className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm text-surface-900">LinkedIn</p>
                      <p className="text-xs text-surface-600 font-medium">Professional profile</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-surface-200 flex-1">
                    <Github className="w-6 h-6 text-surface-900" />
                    <div>
                      <p className="font-semibold text-sm text-surface-900">GitHub</p>
                      <p className="text-xs text-surface-600 font-medium">Project portfolio</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/career/interview-preparation">
                  <button className="btn-primary btn flex items-center gap-2">
                    Interview Prep <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/career/mock-interview">
                  <button className="btn-secondary btn">Mock Interview</button>
                </Link>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-surface-900">Resume Review</h3>
                  <p className="text-surface-500 text-sm">Get feedback on your existing resume</p>
                </div>
              </div>
              <EnquiryForm title="" subtitle="Submit your details and our career team will review your resume and provide actionable feedback." compact />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Build a Resume That Gets Interviews"
        subtitle="Expert guidance on crafting an IT resume that stands out in a competitive market."
        primaryLabel="Get Resume Help"
        primaryHref="/contact"
        secondaryLabel="View Courses"
        secondaryHref="/courses"
      />
    </div>
  );
}
