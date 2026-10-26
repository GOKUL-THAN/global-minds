import { Video, Clock, Users, MessageCircle, Award, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EnquiryForm } from '../components/ui/EnquiryForm';
import { CTASection } from '../components/home/CTASection';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import { usePageMeta } from '../hooks/usePageMeta';

const features = [
  { icon: Video, title: 'Live Instructor-Led Classes', desc: 'Attend live sessions with expert instructors in real time, not pre-recorded videos.' },
  { icon: Clock, title: 'Recorded Session Access', desc: 'Recordings of every class available so you can revise at your own pace.' },
  { icon: Users, title: 'Interactive Learning', desc: 'Ask questions, participate in discussions and collaborate with classmates.' },
  { icon: MessageCircle, title: 'Doubt Clearing Sessions', desc: 'Dedicated doubt-clearing sessions to ensure no question goes unanswered.' },
  { icon: Award, title: 'Certificate on Completion', desc: 'Earn your Global Minds Academy certificate upon successful course completion.' },
  { icon: Globe, title: 'Global Access', desc: 'Learn from anywhere in the world with a stable internet connection.' },
];

export default function OnlineTrainingPage() {
  const siteConfig = useSiteConfig();
  usePageMeta({
    title: 'Online Training — Live Instructor-Led Classes',
    description: 'Learn from anywhere with live instructor-led online classes, recorded sessions, LMS access and doubt-clearing support.',
  });
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Online Training' }]} className="text-white/50 mb-4" />
          <h1 className="display-lg text-white mb-4">Online Training</h1>
          <p className="text-white/80 text-xl max-w-2xl">
            Learn from industry experts through live, instructor-led online classes. Study from anywhere in the world.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="display-md mb-4">Why Online Training at Global Minds Academy?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-surface-100 hover:shadow-card-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">{f.title}</h3>
                <p className="text-surface-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="display-md mb-4">Learn From Anywhere</h2>
              <p className="text-surface-500 mb-6">
                We support learners from across the globe. Our online training is designed to serve students wherever they are.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {siteConfig.countries.map(c => (
                  <div key={c.code} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-surface-100 text-sm text-surface-600">
                    <span className="text-lg">{c.flag}</span>
                    {c.name}
                  </div>
                ))}
              </div>
              <Link to="/courses">
                <button className="btn-primary btn flex items-center gap-2">
                  Browse Online Courses <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="bg-surface-50 rounded-3xl p-8">
              <EnquiryForm title="Enquire About Online Training" compact />
            </div>
          </div>
        </div>
      </section>

      <CTASection title="Start Learning Online Today" subtitle="Live classes, recorded sessions, projects and career support — all online." />
    </div>
  );
}
