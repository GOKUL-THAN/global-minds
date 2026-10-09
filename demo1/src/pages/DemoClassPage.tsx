import { useState } from 'react';
import { CheckCircle, Calendar, Clock, Users, Star, Monitor, Play } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

const popularDemoCourses = [
  { id: 'aws', title: 'AWS Training', duration: '1.5 Hrs', category: 'Cloud', icon: '☁️', rating: 4.9, students: 2400 },
  { id: 'fullstack', title: 'Full Stack (MERN)', duration: '1.5 Hrs', category: 'Development', icon: '💻', rating: 4.8, students: 3100 },
  { id: 'devops', title: 'DevOps Training', duration: '1.5 Hrs', category: 'DevOps', icon: '🔧', rating: 4.9, students: 1800 },
  { id: 'datascience', title: 'Data Science & AI', duration: '1.5 Hrs', category: 'AI / ML', icon: '🧠', rating: 4.8, students: 2700 },
  { id: 'testing', title: 'Software Testing', duration: '1.5 Hrs', category: 'QA', icon: '🛡️', rating: 4.7, students: 2200 },
  { id: 'python', title: 'Python Programming', duration: '1 Hr', category: 'Programming', icon: '🐍', rating: 4.9, students: 3500 },
  { id: 'azure', title: 'Microsoft Azure', duration: '1.5 Hrs', category: 'Cloud', icon: '🔵', rating: 4.8, students: 1600 },
  { id: 'genai', title: 'Generative AI', duration: '1 Hr', category: 'AI / ML', icon: '✨', rating: 4.9, students: 1900 },
];

const upcomingDemos = [
  { course: 'AWS Training', trainer: 'Rajesh Kumar', date: 'Oct 10, 2026', time: '10:00 AM IST', mode: 'Online (Zoom)', seats: 4 },
  { course: 'Full Stack Development', trainer: 'Priya Nair', date: 'Oct 11, 2026', time: '11:00 AM IST', mode: 'Online (Zoom)', seats: 7 },
  { course: 'Data Science & AI', trainer: 'Anitha Reddy', date: 'Oct 12, 2026', time: '7:00 PM IST', mode: 'Online (Zoom)', seats: 10 },
  { course: 'DevOps with Kubernetes', trainer: 'Suresh Anand', date: 'Oct 13, 2026', time: '9:00 AM IST', mode: 'Online (Zoom)', seats: 3 },
  { course: 'Python Programming', trainer: 'Arjun Singh', date: 'Oct 14, 2026', time: '6:00 PM IST', mode: 'Online (Zoom)', seats: 12 },
];

const benefits = [
  'Meet your trainer before committing',
  'See the teaching style and course structure',
  'Ask questions directly to the expert',
  'Understand the batch schedule and timings',
  'Get clarity on placement support',
  'Completely free — no obligation to enroll',
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  course: string;
  preferredDate: string;
  preferredTime: string;
  mode: string;
  message: string;
}

export default function DemoClassPage() {
  usePageMeta({
    title: 'Book a Free Demo Class',
    description: 'Book a free demo class at Global Minds Academy. Experience our teaching style, meet your trainer, and ask questions before enrolling in any course.',
  });

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', course: '', preferredDate: '', preferredTime: '', mode: 'Online', message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-950 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Free Demo Class' }]} className="text-white/50 mb-4" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-medium text-white/90 mb-6">
                <Play className="w-4 h-4 text-yellow-400" />
                100% Free — No Obligation
              </div>
              <h1 className="display-lg text-white mb-6">
                Book Your Free<br />
                <span className="text-yellow-300">Demo Class</span>
              </h1>
              <p className="text-white/70 text-lg mb-8">
                Experience our teaching quality before enrolling. Attend a free live demo session with our expert trainers — ask questions, see the curriculum, and decide with confidence.
              </p>
              <ul className="space-y-3">
                {benefits.map(b => (
                  <li key={b} className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-3xl p-8 text-surface-900 shadow-2xl">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-3 text-surface-900">Demo Booked!</h3>
                  <p className="text-surface-600 mb-2">
                    Thanks, <strong>{form.name}</strong>! Your free demo class for <strong>{form.course || 'the selected course'}</strong> has been scheduled.
                  </p>
                  <p className="text-surface-500 text-sm">
                    You'll receive a confirmation email at <strong>{form.email}</strong> with the Zoom link and details.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm text-brand-600 underline"
                  >
                    Book another demo
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-xl mb-6">Schedule Your Free Demo</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 99999 00000"
                          className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@email.com"
                        className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Course Interested In *</label>
                      <select
                        name="course"
                        required
                        value={form.course}
                        onChange={handleChange}
                        className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                      >
                        <option value="">Select a course</option>
                        {popularDemoCourses.map(c => (
                          <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                        <option value="Other">Other Course</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Preferred Date</label>
                        <input
                          type="date"
                          name="preferredDate"
                          value={form.preferredDate}
                          onChange={handleChange}
                          className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Preferred Time</label>
                        <select
                          name="preferredTime"
                          value={form.preferredTime}
                          onChange={handleChange}
                          className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                        >
                          <option value="">Any time</option>
                          <option>9:00 AM – 11:00 AM</option>
                          <option>11:00 AM – 1:00 PM</option>
                          <option>2:00 PM – 4:00 PM</option>
                          <option>6:00 PM – 8:00 PM</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Mode</label>
                      <div className="flex gap-4">
                        {['Online', 'Classroom'].map(m => (
                          <label key={m} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="mode"
                              value={m}
                              checked={form.mode === m}
                              onChange={handleChange}
                              className="accent-brand-600"
                            />
                            <span className="text-sm text-surface-700">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" fullWidth size="lg">
                      Book Free Demo Now
                    </Button>
                    <p className="text-xs text-surface-400 text-center">
                      By submitting you agree to our Privacy Policy. We won't spam you.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming demos */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-10">
            <h2 className="display-sm mb-3">Upcoming Demo Sessions</h2>
            <p className="text-surface-500">Join a scheduled demo or book a private session.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingDemos.map(d => (
              <div key={d.course + d.date} className="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-card-md transition-shadow">
                <h3 className="font-semibold text-surface-900 mb-1">{d.course}</h3>
                <p className="text-sm text-surface-500 mb-4">Trainer: {d.trainer}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-surface-600">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    {d.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-600">
                    <Clock className="w-4 h-4 text-brand-500" />
                    {d.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-600">
                    <Monitor className="w-4 h-4 text-brand-500" />
                    {d.mode}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-brand-500" />
                    <span className={d.seats <= 4 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {d.seats} seats left
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" fullWidth onClick={() => setSubmitted(false)}>
                  Register for this Demo
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available demo courses */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-10">
            <h2 className="display-sm mb-3">Demo Available For All Popular Courses</h2>
            <p className="text-surface-500">Book a 1–1.5 hr free demo for any course below.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularDemoCourses.map(c => (
              <div key={c.id} className="p-5 bg-surface-50 rounded-2xl hover:bg-brand-50 transition-colors group">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-semibold text-surface-900 group-hover:text-brand-700 mb-1">{c.title}</h3>
                <p className="text-xs text-surface-500 mb-3">{c.category} · {c.duration} demo</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-surface-500">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span>{c.rating}</span>
                    <span>({c.students.toLocaleString()} enrolled)</span>
                  </div>
                  <span className="text-xs font-semibold text-brand-600">Free</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-surface-50">
        <div className="container-xl max-w-3xl">
          <h2 className="display-sm text-center mb-10">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is the demo class really free?', a: 'Yes, 100% free with no hidden charges or obligation to enroll after attending.' },
              { q: 'How long is a demo class?', a: 'Demo sessions are typically 60–90 minutes. You\'ll get a solid overview of the course and can ask questions directly to the trainer.' },
              { q: 'Can I attend multiple demo sessions?', a: 'Absolutely! We encourage you to attend demos for different courses if you\'re exploring options.' },
              { q: 'What is covered in the demo?', a: 'The trainer covers course overview, curriculum highlights, career scope, real-world use cases, and answers all your queries.' },
              { q: 'Is it online or offline?', a: 'We offer both. Online demos happen via Zoom/Google Meet. Offline demos are available at our training centers.' },
            ].map(faq => (
              <div key={faq.q} className="bg-white rounded-2xl p-5 border border-surface-100">
                <h3 className="font-semibold text-surface-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
