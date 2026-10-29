import { useState, type FormEvent } from 'react';
import { Bot, Mail, MessageCircle, Send, X, Sparkles, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';
import { siteConfig } from '../../data/siteConfig';
import { ShinyText } from '../ui/ShinyText';
import { Magnetic } from '../ui/Magnetic';

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
  toolCall?: string;
  recommendedCourse?: {
    slug: string;
    title: string;
  };
}

const suggestedPrompts = [
  'What courses and durations do you offer?',
  'Which course is best for AWS & Cloud?',
  'What capstone projects will I build?',
  'How does 100% placement support work?',
  'Can I attend online or in Chennai?',
];

function getAssistantResponse(question: string): { text: string; toolCall?: string; recommendedCourse?: { slug: string; title: string } } {
  const normalizedQuestion = question.toLowerCase();

  if (/\b(location|located|address|where|centre|center|chennai)\b/.test(normalizedQuestion)) {
    return {
      text: `Global Minds Academy has our flagship campus at ${siteConfig.address.line1}, ${siteConfig.address.city}, ${siteConfig.address.state}, ${siteConfig.address.country}. We also offer full live interactive online batches across the globe.`,
      toolCall: 'locationService.getCampusDetails()',
    };
  }

  if (/\b(project|projects|capstone|portfolio|hands.on)\b/.test(normalizedQuestion)) {
    return {
      text: 'Every program includes real-world capstones: Enterprise Employee Management System (Java & Spring Boot), AI Healthcare Diagnostic Assistant (Python & PyTorch), and Multi-Region Cloud Deployment (AWS & Terraform). Explore our Live Projects section to see source architectures.',
      toolCall: 'projectCatalog.getFeaturedCapstones()',
    };
  }

  if (/\b(placement|career|job|hiring|salary|lpa|package|interview)\b/.test(normalizedQuestion)) {
    return {
      text: 'Our career support features 1-on-1 resume optimization, mock technical interviews with industry architects, and direct hiring drives across 50+ hiring partners. Recent graduates placed with packages up to 14 LPA.',
      toolCall: 'placementService.getPartnerStats()',
    };
  }

  if (/\b(batch|schedule|timing|date|weekend|weekday)\b/.test(normalizedQuestion)) {
    return {
      text: 'We host flexible Weekday morning (7 AM - 9 AM), Weekday evening (7 PM - 9 PM), and Weekend intensive batches. Review the Batch Schedule page or message admissions for immediate enrollment.',
      toolCall: 'scheduleService.getUpcomingCohorts()',
    };
  }

  if (/\b(fee|fees|price|cost|scholarship|discount|emi)\b/.test(normalizedQuestion)) {
    return {
      text: 'We provide merit-based scholarships up to 40% and flexible zero-cost EMI plans. Contact our counselor via WhatsApp or callback to calculate your exact scholarship grant.',
      toolCall: 'scholarshipEngine.checkEligibility()',
    };
  }

  const matchedCourse = publicCourseCatalog.find(course => {
    const title = course.title.toLowerCase();
    if (normalizedQuestion.includes(title)) return true;
    if (title === 'aws / cloud' && /\b(aws|cloud|devops)\b/.test(normalizedQuestion)) return true;
    if (title === 'full stack development' && /\b(full.stack|react|web|java|python)\b/.test(normalizedQuestion)) return true;
    if (title === 'machine learning' && /\b(ai|ml|data science|machine learning)\b/.test(normalizedQuestion)) return true;
    if (title === 'cyber security' && /\b(cyber|security|ethical hacking)\b/.test(normalizedQuestion)) return true;
    return false;
  });

  if (matchedCourse) {
    return {
      text: `${matchedCourse.title} is an intensive ${matchedCourse.duration} ${matchedCourse.level.toLowerCase()} program. ${matchedCourse.shortDescription} Includes hands-on labs and placement guarantee assistance.`,
      toolCall: `courseCatalog.lookup('${matchedCourse.sourceSlug}')`,
      recommendedCourse: {
        slug: matchedCourse.sourceSlug,
        title: matchedCourse.title,
      },
    };
  }

  return {
    text: `Global Minds Academy offers industry-aligned programs in Cloud Architecture, AI & Data Science, Full Stack Engineering, and Cyber Security. Let me know which skill track or career goal you want to explore!`,
    toolCall: 'aiAgent.generalSearch()',
  };
}

export function QuickContactAssistant() {
  const [quickContactsOpen, setQuickContactsOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: '👋 Hi! I am your Global Minds AI Counselor. Ask me anything about course syllabus, batch timings, placement records, or campus labs.',
      toolCall: 'agent.initialize("Global Minds Knowledge Graph v2.4")',
    },
  ]);

  const sendQuestion = (text: string) => {
    const trimmedQuestion = text.trim();
    if (!trimmedQuestion) return;

    setMessages(current => [
      ...current,
      { role: 'user', text: trimmedQuestion },
    ]);
    setQuestion('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAssistantResponse(trimmedQuestion);
      setMessages(current => [
        ...current,
        {
          role: 'assistant',
          text: response.text,
          toolCall: response.toolCall,
          recommendedCourse: response.recommendedCourse,
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(question);
  };

  return (
    <>
      {assistantOpen && (
        <section
          aria-label="Global Minds AI Assistant"
          className="fixed bottom-24 right-4 z-[70] flex max-h-[min(38rem,calc(100vh-7rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-2xl sm:right-6 backdrop-blur-xl"
        >
          {/* Header */}
          <header className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-brand-800 to-teal-950 px-5 py-4 text-white shadow-md">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/20 border border-teal-300/30 backdrop-blur-md shadow-inner">
                  <Bot className="h-6 w-6 text-teal-300" aria-hidden="true" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-teal-950" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base flex items-center gap-1.5">
                    <ShinyText text="Global Minds AI" shinyColor="rgba(255, 255, 255, 0.95)" />
                    <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-[10px] font-semibold text-teal-200 border border-teal-300/30">v2.4 Agent</span>
                  </h2>
                  <p className="text-xs text-teal-200/80 font-medium">Smart Course & Career Navigator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close AI assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 space-y-3.5 overflow-y-auto bg-surface-50 p-4 scroll-smooth" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Agent Activity & Tool Calls badge (React Bits AI & Agents) */}
                {message.role === 'assistant' && message.toolCall && (
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] text-surface-400 font-mono">
                    <Sparkles className="h-3 w-3 text-teal-600 animate-pulse" />
                    <span>Agent Plan: {message.toolCall}</span>
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-teal-600 text-white font-medium rounded-br-sm'
                      : 'bg-white border border-surface-200 text-surface-800 font-normal rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>

                  {/* Course Chip Recommendation */}
                  {message.recommendedCourse && (
                    <div className="mt-3 pt-2.5 border-t border-surface-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                        <Compass className="h-4 w-4" />
                        <span>{message.recommendedCourse.title}</span>
                      </div>
                      <Link
                        to={`/courses/${message.recommendedCourse.slug}`}
                        onClick={() => setAssistantOpen(false)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        Explore <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 rounded-2xl bg-white border border-surface-200 px-4 py-3 text-xs text-surface-500 w-fit">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                </span>
                <span>Reasoning catalog response...</span>
              </div>
            )}

            {/* Prompt Input Pills */}
            {messages.length === 1 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider px-1">Suggested prompts</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedPrompts.map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendQuestion(prompt)}
                      className="rounded-xl border border-brand-200/80 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand-900 transition-all hover:bg-brand-50 hover:border-brand-400 active:scale-95 shadow-sm"
                    >
                      ✨ {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-surface-200 bg-white p-3">
            <div className="relative flex items-center">
              <label className="sr-only" htmlFor="assistant-question">Ask about courses, training or projects</label>
              <input
                id="assistant-question"
                value={question}
                onChange={event => setQuestion(event.target.value)}
                placeholder="Ask courses, placements, fees..."
                className="w-full rounded-2xl border border-surface-200 bg-surface-50/70 py-2.5 pl-4 pr-12 text-sm text-surface-900 placeholder:text-surface-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                aria-label="Send question"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-surface-400">
              Direct counselor hotline: <a href={`tel:${siteConfig.phone}`} className="font-semibold text-brand-600 hover:underline">{siteConfig.phone}</a>
            </p>
          </form>
        </section>
      )}

      {/* Launcher Buttons */}
      <div className="fixed bottom-24 right-4 z-[70] flex flex-col items-center gap-3 sm:right-6">
        {quickContactsOpen && (
          <>
            <Magnetic>
              <button
                type="button"
                onClick={() => setAssistantOpen(open => !open)}
                aria-label={assistantOpen ? 'Close AI assistant' : 'Open AI assistant'}
                aria-expanded={assistantOpen}
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-700 via-teal-600 to-emerald-500 text-white shadow-xl transition-transform hover:scale-110 active:scale-95 border border-white/20"
              >
                <Bot className="h-6 w-6" aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-extrabold text-slate-900 shadow">
                  AI
                </span>
              </button>
            </Magnetic>
            <Magnetic>
              <a
                href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat on WhatsApp at ${siteConfig.phone}`}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl transition-transform hover:scale-110 active:scale-95 border border-white/20"
              >
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label={`Email ${siteConfig.email}`}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl transition-transform hover:scale-110 active:scale-95 border border-white/20"
              >
                <Mail className="h-6 w-6" aria-hidden="true" />
              </a>
            </Magnetic>
          </>
        )}
        <Magnetic>
          <button
            type="button"
            onClick={() => setQuickContactsOpen(open => !open)}
            aria-label={quickContactsOpen ? 'Close quick contact' : 'Open quick contact'}
            aria-expanded={quickContactsOpen}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-900 text-white shadow-xl transition-transform hover:scale-110 active:scale-95 border border-white/10"
          >
            {quickContactsOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          </button>
        </Magnetic>
      </div>
    </>
  );
}
