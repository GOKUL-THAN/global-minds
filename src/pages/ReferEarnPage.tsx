import { useState } from 'react';
import { Gift, Copy, CheckCircle, Share2, Zap, ArrowRight, Trophy } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { ShinyText } from '../components/ui/ShinyText';
import { DecryptedText } from '../components/ui/DecryptedText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

// ── How it works steps ─────────────────────────────────────
const howItWorks = [
  {
    step: '01',
    icon: '🔗',
    title: 'Get Your Referral Link',
    desc: 'Log in to your dashboard and copy your unique referral link or share code.',
  },
  {
    step: '02',
    icon: '📢',
    title: 'Share With Friends',
    desc: 'Share your link via WhatsApp, email, LinkedIn or any platform you prefer.',
  },
  {
    step: '03',
    icon: '🎓',
    title: 'Friend Enrolls',
    desc: 'When your friend enrolls in any paid course using your link, the referral is tracked.',
  },
  {
    step: '04',
    icon: '💰',
    title: 'Both of You Earn',
    desc: 'You get ₹3,000 credited to your wallet. Your friend gets ₹1,000 off their course fee.',
  },
];

// ── Reward tiers ───────────────────────────────────────────
const rewardTiers = [
  {
    tier: 'Starter',
    referrals: '1–2',
    yourReward: '₹3,000',
    friendDiscount: '₹1,000 off',
    badge: null,
    color: 'border-surface-200 bg-white',
    textColor: 'text-surface-900',
  },
  {
    tier: 'Champion',
    referrals: '3–5',
    yourReward: '₹4,000',
    friendDiscount: '₹1,500 off',
    badge: 'Most Popular',
    color: 'border-brand-400 bg-brand-50',
    textColor: 'text-brand-700',
  },
  {
    tier: 'Ambassador',
    referrals: '6–10',
    yourReward: '₹5,000',
    friendDiscount: '₹2,000 off',
    badge: 'Best Value',
    color: 'border-accent-400 bg-accent-50',
    textColor: 'text-accent-700',
  },
  {
    tier: 'Legend',
    referrals: '11+',
    yourReward: '₹7,000',
    friendDiscount: '₹2,500 off',
    badge: 'Elite',
    color: 'border-yellow-400 bg-yellow-50',
    textColor: 'text-yellow-700',
  },
];

// ── Top referrers leaderboard ──────────────────────────────
const leaderboard = [
  { rank: 1, name: 'Priya S.', city: 'Chennai', referrals: 34, earned: '₹1,02,000', avatar: 'PS', color: 'bg-yellow-500' },
  { rank: 2, name: 'Rahul M.', city: 'Bangalore', referrals: 28, earned: '₹84,000', avatar: 'RM', color: 'bg-surface-400' },
  { rank: 3, name: 'Kavitha R.', city: 'Hyderabad', referrals: 22, earned: '₹66,000', avatar: 'KR', color: 'bg-orange-600' },
  { rank: 4, name: 'Arjun D.', city: 'Mumbai', referrals: 17, earned: '₹51,000', avatar: 'AD', color: 'bg-brand-500' },
  { rank: 5, name: 'Meena P.', city: 'Pune', referrals: 15, earned: '₹45,000', avatar: 'MP', color: 'bg-green-500' },
];

// ── FAQs ──────────────────────────────────────────────────
const faqs = [
  {
    q: 'Who can refer?',
    a: 'Anyone who has enrolled in at least one paid course at Global Minds Technologies can join the Refer & Earn programme.',
  },
  {
    q: 'Is there a limit on how many people I can refer?',
    a: 'No limit! Refer as many friends as you like. The more you refer, the higher your reward tier and earnings per referral.',
  },
  {
    q: 'When do I receive my reward?',
    a: 'Your ₹3,000+ reward is credited to your Global Minds Technologies wallet within 7 business days after your referred friend completes payment.',
  },
  {
    q: 'How can I use my wallet balance?',
    a: 'Use your wallet balance to pay for future courses, workshops, or certification prep programs on our platform.',
  },
  {
    q: 'What if my friend already has an account?',
    a: 'Your friend must be a new enrollment (first paid course purchase). Referrals for existing enrolled students are not eligible.',
  },
  {
    q: 'Can I stack the referral discount with other offers?',
    a: 'The ₹1,000 friend discount can be stacked with early bird pricing but not with other coupon codes.',
  },
];

interface ReferForm { name: string; friendName: string; friendEmail: string; friendPhone: string; course: string }

export default function ReferEarnPage() {
  usePageMeta({
    title: 'Refer & Earn',
    description: 'Refer a friend to Global Minds Technologies and earn up to ₹7,000 per referral. Your friend gets a discount too. Join the Refer & Earn programme today.',
  });

  const referralCode = 'GA-DEMO-2026';
  const referralUrl = new URL('/register', siteConfig.siteUrl);
  referralUrl.searchParams.set('ref', referralCode);
  const referralLink = referralUrl.toString();
  const invitationSubject = 'Join Global Minds Technologies';
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [form, setForm] = useState<ReferForm>({ name: '', friendName: '', friendEmail: '', friendPhone: '', course: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(0);
  const invitationBody = `Hi ${form.friendName || 'there'},\n\nI thought you might be interested in learning with Global Minds Technologies. Use my sample referral link: ${referralLink}`;
  const invitationEmailUrl = `mailto:${encodeURIComponent(form.friendEmail)}?subject=${encodeURIComponent(invitationSubject)}&body=${encodeURIComponent(invitationBody)}`;

  const handleCopy = async () => {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError('Copy is unavailable in this browser. Select the referral link above and copy it manually.');
    }
  };

  const shareText = `Join Global Minds Technologies using my referral link: ${referralLink}`;
  const shareLinks = [
    { channel: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(shareText)}` },
    { channel: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}` },
    { channel: 'Email', href: `mailto:?subject=${encodeURIComponent('Join Global Minds Technologies')}&body=${encodeURIComponent(shareText)}` },
    { channel: 'Telegram', href: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join Global Minds Technologies')}` },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = invitationEmailUrl;
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-20 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Refer & Earn' }]} className="mb-4" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="page-hero-badge inline-flex items-center gap-2 mb-6">
                <Gift className="w-4 h-4 text-amber-300" />
                <ShinyText text="Earn up to ₹7,000 per referral" shinyColor="rgba(23, 108, 115, 0.9)" />
              </div>
              <h1 className="page-hero-title mb-6">
                Refer a Friend.<br />
                <DecryptedText
                  text="Both of You Win."
                  speed={40}
                  maxIterations={15}
                  sequential={true}
                  revealDirection="start"
                  className="page-hero-highlight"
                />
              </h1>
              <p className="page-hero-desc text-xl mb-8 max-w-xl leading-relaxed">
                Share Global Minds Technologies with your friends. When they enroll, you earn ₹3,000 – ₹7,000 in your wallet and they get a discount on their course fee.
              </p>

              {/* Referral link card */}
              <div className="rounded-2xl p-5 border border-teal-200 bg-white/95 shadow-md backdrop-blur-md">
                <p className="text-sm text-surface-800 mb-3 font-semibold">Your Referral Link (Demo)</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 font-mono truncate" title={referralLink}>
                    {referralLink}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? 'Referral link copied' : 'Copy referral link'}
                    className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-teal-900/20 transition-colors flex-shrink-0"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {copyError && <p role="alert" className="mt-2 text-sm text-amber-700 font-medium">{copyError}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {shareLinks.map(({ channel, href }) => (
                    <a
                      key={channel}
                      href={href}
                      target={channel === 'Email' ? undefined : '_blank'}
                      rel={channel === 'Email' ? undefined : 'noopener noreferrer'}
                      className="flex items-center gap-1.5 text-xs bg-surface-100 hover:bg-teal-50 border border-surface-200 hover:border-teal-300 rounded-lg px-3 py-1.5 text-surface-700 hover:text-teal-900 font-medium transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-teal-600" />
                      {channel}
                    </a>
                  ))}
                </div>
                <p className="mt-3 text-xs text-surface-600 font-medium">* This is a sample referral link. Personal referral tracking requires an active learner account.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '👥', value: '150+', label: 'Successful Referrals' },
                { icon: '💰', value: '₹1.5 Lakh', label: 'Rewards Paid Out' },
                { icon: '🎁', value: '₹3,000', label: 'Min. Reward Per Referral' },
                { icon: '⚡', value: '7 Days', label: 'Reward Payout Time' },
              ].map(s => (
                <div key={s.label} className="page-hero-chip flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="font-display font-bold text-2xl text-white mb-1">{s.value}</div>
                  <div className="text-xs text-teal-200/80 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-bold text-brand-700 uppercase tracking-wider mb-3">Simple Process</span>
            <h2 className="display-md mb-4">How It Works</h2>
            <p className="text-surface-600 font-medium max-w-xl mx-auto">Four easy steps to start earning rewards for every friend you bring to Global Minds Technologies.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, idx) => {
              const isOpen = selectedStep === idx;

              return (
                <div key={step.step} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`refer-step-${idx}`}
                    onClick={() => setSelectedStep(isOpen ? null : idx)}
                    className={`w-full rounded-2xl p-6 text-center h-full transition-all border ${
                    isOpen ? 'bg-brand-50 border-brand-300 shadow-card-md' : 'bg-surface-50 border-surface-200 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    <div className="relative flex flex-col items-center justify-between h-full">
                      <div className="absolute top-0 right-0 text-4xl font-black text-surface-200">{step.step}</div>
                      <div className="text-4xl mb-4 mt-6">{step.icon}</div>
                      <h3 className="font-semibold text-surface-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-surface-600 font-medium mb-4">{step.desc}</p>
                      <span className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-bold text-brand-700">
                        {isOpen ? 'Hide details' : 'View details'}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div id={`refer-step-${idx}`} className="mt-3 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-left text-sm text-surface-800 font-medium">
                      <p className="font-bold text-brand-800 mb-1">What happens next</p>
                      <p>
                        {idx === 0 && 'Generate your unique referral link and share it with your network to start tracking every successful enrollment.'}
                        {idx === 1 && 'Send the link through WhatsApp, email, social media, or direct messaging to reach potential learners faster.'}
                        {idx === 2 && 'Once your friend enrolls in a paid program, the referral is verified and added to your total reward balance.'}
                        {idx === 3 && 'Your wallet gets credited and your friend receives their course discount, creating a win-win referral outcome.'}
                      </p>
                    </div>
                  )}

                  {idx < howItWorks.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-brand-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reward tiers */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-bold text-brand-700 uppercase tracking-wider mb-3">Reward Tiers</span>
            <h2 className="display-md mb-4">Earn More as You Refer More</h2>
            <p className="text-surface-600 font-medium max-w-xl mx-auto">The more friends you refer, the higher your per-referral reward. Rewards are cumulative and never expire.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {rewardTiers.map(tier => (
              <SpotlightCard key={tier.tier} className={`rounded-2xl border-2 p-6 relative ${tier.color} hover:shadow-card-md transition-shadow`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold bg-brand-700 text-white whitespace-nowrap shadow`}>
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="text-center pt-2">
                  <div className={`font-display font-black text-2xl mb-1 ${tier.textColor}`}>{tier.tier}</div>
                  <div className="text-sm text-surface-600 font-semibold mb-4">{tier.referrals} referrals</div>
                  <div className="border-t border-surface-200 pt-4 space-y-3">
                    <div>
                      <p className="text-xs text-surface-600 font-medium mb-0.5">You earn</p>
                      <p className="font-bold text-xl text-surface-900">{tier.yourReward}</p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-600 font-medium mb-0.5">Friend gets</p>
                      <p className="font-bold text-green-700">{tier.friendDiscount}</p>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
          <p className="text-xs text-surface-600 font-medium text-center mt-5">
            * Rewards credited as wallet balance. Payout within 7 business days post friend's payment confirmation.
          </p>
        </div>
      </section>

      {/* Refer a friend form + Leaderboard side by side */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Direct referral form */}
            <div>
              <h2 className="display-sm mb-3">Refer a Friend Directly</h2>
              <p className="text-surface-500 mb-6">
                Don't want to share a link? Fill in your friend's details and we'll send them an invitation with your referral credit.
              </p>
              <div className="bg-surface-50 rounded-2xl p-6 border border-surface-100">
                {formSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-2">Invitation Email Draft Ready</h3>
                    <p className="text-surface-600 mb-2">
                      Your email app should open with an invitation for <strong>{form.friendEmail}</strong>. Review and send it to deliver the invitation.
                    </p>
                    <p className="text-surface-500 text-sm mb-6">
                      This website does not send or track referral invitations yet. <a href={invitationEmailUrl} className="font-semibold text-brand-700 underline">Open the email draft again</a>.
                    </p>
                    <Button variant="secondary" onClick={() => { setFormSubmitted(false); setForm({ name: '', friendName: '', friendEmail: '', friendPhone: '', course: '' }); }}>
                      Refer Another Friend
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Your Name *</label>
                      <input
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Friend's Name *</label>
                        <input
                          name="friendName"
                          required
                          value={form.friendName}
                          onChange={handleChange}
                          placeholder="Friend's name"
                          className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Friend's Phone *</label>
                        <input
                          name="friendPhone"
                          required
                          value={form.friendPhone}
                          onChange={handleChange}
                          placeholder="+91 99999 00000"
                          className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Friend's Email *</label>
                      <input
                        type="email"
                        name="friendEmail"
                        required
                        value={form.friendEmail}
                        onChange={handleChange}
                        placeholder="friend@email.com"
                        className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Suggest a Course (Optional)</label>
                      <select
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                      >
                        <option value="">Any course</option>
                        {['AWS / Cloud', 'DevOps Training', 'Full Stack Development', 'Data Science & AI', 'Python Training', 'Software Testing', 'Cyber Security'].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" fullWidth size="lg">
                      <Gift className="w-4 h-4 mr-2" />
                      Send Referral Invitation
                    </Button>
                    <p className="text-xs text-surface-400 text-center">
                      Your friend will receive a personalised invitation with your referral code.
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="display-sm">Top Referrers</h2>
              </div>
              <p className="text-surface-500 mb-6">
                Our most active ambassadors this month. Top referrers get bonus rewards and exclusive perks.
              </p>
              <div className="space-y-3">
                {leaderboard.map(person => (
                  <SpotlightCard
                    key={person.rank}
                    className={`flex items-center gap-4 p-4 rounded-2xl border ${
                      person.rank === 1 ? 'border-yellow-300 bg-yellow-50' :
                      person.rank === 2 ? 'border-surface-300 bg-surface-50' :
                      person.rank === 3 ? 'border-orange-300 bg-orange-50' :
                      'border-surface-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        person.rank === 1 ? 'bg-yellow-500 text-white' :
                        person.rank === 2 ? 'bg-surface-400 text-white' :
                        person.rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-surface-200 text-surface-700'
                      }`}>
                        {person.rank === 1 ? '🥇' : person.rank === 2 ? '🥈' : person.rank === 3 ? '🥉' : `#${person.rank}`}
                      </div>
                      <div className={`w-10 h-10 ${person.color} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {person.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-surface-900">{person.name}</p>
                        <p className="text-xs text-surface-500">{person.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">{person.earned}</p>
                        <p className="text-xs text-surface-500">{person.referrals} referrals</p>
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>

              {/* Bonus perks */}
              <div className="mt-6 bg-gradient-to-r from-brand-50 to-accent-50 rounded-2xl p-5 border border-brand-100">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-surface-900">Ambassador Perks (10+ Referrals)</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'Free enrollment in any 1 course of your choice',
                    'Global Minds Technologies Alumni badge & certificate',
                    'Priority support & dedicated account manager',
                    'Early access to new courses and events',
                  ].map(perk => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-surface-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section bg-surface-50">
        <div className="container-xl max-w-3xl">
          <h2 className="display-sm text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="font-medium text-surface-900">{faq.q}</span>
                  <span className={`w-6 h-6 rounded-full border-2 border-surface-200 flex items-center justify-center flex-shrink-0 ml-4 transition-transform ${openFaq === idx ? 'rotate-45 border-brand-500 bg-brand-50' : ''}`}>
                    <span className="text-surface-500 text-sm font-bold leading-none">+</span>
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-sm text-surface-600 leading-relaxed border-t border-surface-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms note */}
      <div className="container-xl py-4">
        <p className="text-xs text-surface-400 text-center">
          * Refer & Earn programme terms apply. Rewards subject to referral verification. Global Minds Technologies reserves the right to modify or discontinue the programme at any time.
        </p>
      </div>

      <CTASection />
    </div>
  );
}
