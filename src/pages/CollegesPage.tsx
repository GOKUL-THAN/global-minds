import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap, Users, BookOpen, Award, CheckCircle, Loader2, Send,
  Building2, Star, Handshake, FlaskConical, Briefcase, Lightbulb,
} from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { enquiryService } from '../services/enquiryService';
import { cn } from '../utils/cn';

const schema = z.object({
  institutionName: z.string().min(2, 'Institution name required'),
  contactName: z.string().min(2, 'Contact name required'),
  designation: z.string().min(2, 'Designation required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required'),
  city: z.string().min(2, 'City required'),
  studentStrength: z.string().min(1, 'Student strength required'),
  enquiryType: z.string().min(1, 'Enquiry type required'),
  programs: z.array(z.string()).optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const programOptions = [
  'AWS / Cloud', 'Data Science', 'Machine Learning', 'Full Stack Development',
  'Cyber Security', 'Software Testing', 'Automation Testing',
];

const benefits = [
  {
    icon: Handshake,
    title: 'MoU & Tie-up Programs',
    desc: 'Formalise your institution\'s partnership with Global Minds Academy through a structured MoU agreement.',
  },
  {
    icon: GraduationCap,
    title: 'Campus Placement Support',
    desc: 'Trained students are placement-ready with resume prep, mock interviews and direct company referrals.',
  },
  {
    icon: FlaskConical,
    title: 'Technology Lab Setup',
    desc: 'Set up industry-standard technology labs with our guidance on tools, infrastructure and curriculum.',
  },
  {
    icon: BookOpen,
    title: 'Curriculum Integration',
    desc: 'Integrate industry-relevant modules into your existing curriculum with support from our senior trainers.',
  },
  {
    icon: Award,
    title: 'Joint Certification',
    desc: 'Students earn a co-branded Global Minds Academy certificate. Global Minds Academy has 50+ hiring partners.',
  },
  {
    icon: Users,
    title: 'Faculty Development',
    desc: 'Upskill your faculty with hands-on workshops, train-the-trainer programs and research collaborations.',
  },
];

const offerings = [
  {
    id: 'college-partnerships',
    icon: GraduationCap,
    title: 'College Partnerships',
    subtitle: 'Institutional tie-up programs',
    items: ['MoU & formal tie-up agreement', 'Curriculum integration support', 'Industry mentorship programs', 'Joint certification programs', 'Placement tie-up for students', 'Technology lab setup guidance'],
  },
  {
    id: 'campus-recruitment',
    icon: Briefcase,
    title: 'Campus Recruitment',
    subtitle: 'Hire our trained graduates',
    items: ['Access to placement-ready graduates', 'Scheduled campus drive coordination', 'Pre-assessed skill profiles', 'Interview slot booking', 'Dedicated HR relationship manager', 'Diversity hiring support'],
  },
  {
    id: 'student-programs',
    icon: Lightbulb,
    title: 'Student Programs',
    subtitle: 'Skill development for students',
    items: ['Industry bootcamp programs', 'Internship placement programs', 'Live project training', 'Certification prep courses', 'Soft skills & communication training', 'Free demo sessions'],
  },
  {
    id: 'faculty-development',
    icon: Star,
    title: 'Faculty Development',
    subtitle: 'Empower your teaching staff',
    items: ['Faculty training & workshops', 'Workshop series on latest tech', 'Research collaboration support', 'Train-the-trainer certification', 'Curriculum design consulting', 'Ongoing academic mentorship'],
  },
];

const stats = [
  { value: '120+', label: 'College Partners' },
  { value: '15,000+', label: 'Students Trained' },
  { value: '92%', label: 'Placement Rate' },
  { value: '50+', label: 'Hiring Partners' },
];

export default function CollegesPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    const result = await enquiryService.submitCollegeEnquiry({
      ...data,
      programs: data.programs ?? [],
      message: data.message ?? '',
    });
    if (result.success) {
      setSuccess(true);
      reset();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Colleges & Universities' }]} className="text-white/50 mb-4" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 mb-4">
                <Building2 className="w-4 h-4" />
                Institutional Partnership Program
              </div>
              <h1 className="display-lg text-white mb-4">
                Partner with Global Minds Academy
              </h1>
              <p className="text-white/70 text-xl max-w-2xl">
                Empower your students with AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a href="#college-enquiry" className="btn-primary btn">
                  Enquire Now
                </a>
                <a href="#offerings" className="px-5 py-2.5 rounded-xl border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                  View Programs
                </a>
              </div>
            </div>
            {/* Stats strip */}
            <div className="grid grid-cols-2 gap-4 lg:gap-5 lg:w-72 flex-shrink-0">
              {stats.map(stat => (
                <div key={stat.label} className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why partner section */}
      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Why Partner With Us</p>
            <h2 className="display-md mb-4">Everything your institution needs</h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              From MoU sign-up to placement support, we offer end-to-end institutional programs tailored to your college's needs.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(b => (
              <a
                key={b.title}
                href="#college-enquiry"
                className="block p-6 rounded-2xl border border-surface-100 hover:shadow-card-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={`Enquire about: ${b.title}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">{b.title}</h3>
                <p className="text-surface-500 text-sm">{b.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Four offerings */}
      <section className="section bg-surface-50" id="offerings">
        <div className="container-xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Our Offerings</p>
            <h2 className="display-md mb-4">Programs designed for institutions</h2>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {offerings.map(o => {
              const Icon = o.icon;
              return (
                <div key={o.title} id={o.id} className="bg-white rounded-2xl border border-surface-100 p-6 hover:shadow-card-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="font-bold text-surface-900 mb-1">{o.title}</h3>
                  <p className="text-xs text-brand-600 font-medium mb-4">{o.subtitle}</p>
                  <ul className="space-y-2">
                    {o.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-surface-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section className="section" id="college-enquiry">
        <div className="container-xl">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-card border border-surface-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="heading-xl">College / University Enquiry</h2>
                  <p className="text-surface-500 text-sm">Our institutional team will respond within 1 business day.</p>
                </div>
              </div>

              {success ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold text-surface-900 text-xl mb-2">Enquiry Received!</h3>
                  <p className="text-surface-500 max-w-sm mx-auto">
                    Thank you for reaching out. Our institutional partnerships team will contact you within 1 business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                  {error && (
                    <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  {/* Row 1: Institution + Contact */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Institution Name *</label>
                      <input
                        type="text"
                        placeholder="College / University name"
                        className={cn('form-input', errors.institutionName && 'border-red-400')}
                        {...register('institutionName')}
                      />
                      {errors.institutionName && <p className="form-error">{errors.institutionName.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Contact Person *</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        className={cn('form-input', errors.contactName && 'border-red-400')}
                        {...register('contactName')}
                      />
                      {errors.contactName && <p className="form-error">{errors.contactName.message}</p>}
                    </div>
                  </div>

                  {/* Row 2: Designation + City */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Designation *</label>
                      <input
                        type="text"
                        placeholder="e.g. HOD, Principal, TPO"
                        className={cn('form-input', errors.designation && 'border-red-400')}
                        {...register('designation')}
                      />
                      {errors.designation && <p className="form-error">{errors.designation.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        placeholder="City / Location"
                        className={cn('form-input', errors.city && 'border-red-400')}
                        {...register('city')}
                      />
                      {errors.city && <p className="form-error">{errors.city.message}</p>}
                    </div>
                  </div>

                  {/* Row 3: Email + Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Official Email *</label>
                      <input
                        type="email"
                        placeholder="you@college.edu.in"
                        className={cn('form-input', errors.email && 'border-red-400')}
                        {...register('email')}
                      />
                      {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className={cn('form-input', errors.phone && 'border-red-400')}
                        {...register('phone')}
                      />
                      {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                    </div>
                  </div>

                  {/* Row 4: Student strength + Enquiry type */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Student Strength *</label>
                      <select
                        className={cn('form-select', errors.studentStrength && 'border-red-400')}
                        {...register('studentStrength')}
                      >
                        <option value="">Select student count</option>
                        <option value="Below 500">Below 500</option>
                        <option value="500–1000">500 – 1,000</option>
                        <option value="1000–3000">1,000 – 3,000</option>
                        <option value="3000–5000">3,000 – 5,000</option>
                        <option value="5000+">5,000+</option>
                      </select>
                      {errors.studentStrength && <p className="form-error">{errors.studentStrength.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Enquiry Type *</label>
                      <select
                        className={cn('form-select', errors.enquiryType && 'border-red-400')}
                        {...register('enquiryType')}
                      >
                        <option value="">Select enquiry type</option>
                        <option value="College Partnership / MoU">College Partnership / MoU</option>
                        <option value="Campus Placement">Campus Placement</option>
                        <option value="Student Training Programs">Student Training Programs</option>
                        <option value="Faculty Development">Faculty Development</option>
                        <option value="Curriculum Integration">Curriculum Integration</option>
                        <option value="Technology Lab Setup">Technology Lab Setup</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.enquiryType && <p className="form-error">{errors.enquiryType.message}</p>}
                    </div>
                  </div>

                  {/* Programs */}
                  <div>
                    <label className="form-label">Programs of Interest</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {programOptions.map(prog => (
                        <label key={prog} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={prog}
                            className="w-3.5 h-3.5 text-brand-600 rounded"
                            {...register('programs')}
                          />
                          <span className="text-xs text-surface-600">{prog}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="form-label">Message / Requirements</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your institution's needs, upcoming batch, or any specific requirements..."
                      className="form-input resize-none"
                      {...register('message')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary btn w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Enquiry...</>
                      : <><Send className="w-4 h-4" /> Submit College Enquiry</>}
                  </button>

                  <p className="text-xs text-surface-400 text-center">
                    By submitting, you agree to be contacted by our institutional partnerships team.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Empower Your Students with Industry Skills"
        subtitle="Partner with Global Minds Academy for MoU programs, student training, faculty development and campus placement."
        primaryLabel="Submit Enquiry"
        primaryHref="#college-enquiry"
        secondaryLabel="View All Courses"
        secondaryHref="/courses"
      />
    </div>
  );
}
