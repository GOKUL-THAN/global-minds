import { useState, type FormEvent } from 'react';
import { Bot, Mail, MessageCircle, Send, X } from 'lucide-react';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';
import { useSiteConfig } from '../../contexts/SiteConfigContext';

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

const suggestedQuestions = [
  'What courses and durations do you offer?',
  'What capstone projects will I build?',
  'How does the training work?',
  'What career support is available?',
  'How can I contact the academy?',
];

function getAssistantResponse(question: string, siteConfig: ReturnType<typeof useSiteConfig>): string {
  const normalizedQuestion = question.toLowerCase();

  if (/\b(location|located|address|where|centre|center)\b/.test(normalizedQuestion)) {
    return `Global Minds Academy is located at ${siteConfig.address.line1}, ${siteConfig.address.city}, ${siteConfig.address.state}, ${siteConfig.address.country}. You can contact the team at ${siteConfig.phone} or ${siteConfig.email}.`;
  }

  if (/\b(project|projects|capstone|portfolio)\b/.test(normalizedQuestion)) {
    return 'The website highlights projects including a Smart Employee Management System (Java 21, Spring Boot, Spring Security, React, Vite, MySQL and JWT), an AI Healthcare Assistant (Python, PyTorch, TensorFlow, OpenCV, Hugging Face and Streamlit), and a Cloud-Based E-Commerce Deployment (AWS, Docker, Terraform and Jenkins). Visit Live Projects to explore more.';
  }

  if (/\b(teach|teaching|method|approach|practical|lab|mentor|mentorship|hands.on)\b/.test(normalizedQuestion)) {
    return 'Global Minds Academy emphasizes practical labs, real-world capstone projects and 1-on-1 mentorship. The website describes guidance from senior software architects and AI researchers. Training options include online and classroom programs.';
  }

  if (/\b(placement|career|job|hiring|resume|interview|support)\b/.test(normalizedQuestion)) {
    return 'Career support includes resume and profile preparation, interview practice, job-search guidance and placement assistance. Outcomes depend on each learner; contact admissions to discuss support for your target role.';
  }

  if (/\b(batch|schedule|timing|when|start date)\b/.test(normalizedQuestion)) {
    return 'For current batch dates and timings, please check the Batch Schedule page or contact our admissions team.';
  }

  if (/\b(fee|fees|price|cost|scholarship|discount)\b/.test(normalizedQuestion)) {
    return 'Fees and scholarship availability can vary by course and batch. Please contact admissions for current pricing and eligibility details.';
  }

  if (/\b(contact|phone|call|whatsapp|email|speak|counsel|admissions)\b/.test(normalizedQuestion)) {
    return `Contact Global Minds Academy by phone or WhatsApp at ${siteConfig.phone}, or email ${siteConfig.email}. The academy is in ${siteConfig.address.city}, ${siteConfig.address.state}.`;
  }

  const matchedCourse = publicCourseCatalog.find(course => {
    const title = course.title.toLowerCase();
    if (normalizedQuestion.includes(title)) return true;
    if (title === 'aws / cloud' && /\b(aws|cloud)\b/.test(normalizedQuestion)) return true;
    if (title === 'full stack development' && /\b(full.stack|react|node.js)\b/.test(normalizedQuestion)) return true;
    if (title === 'machine learning' && /\b(ai|artificial intelligence|ml)\b/.test(normalizedQuestion)) return true;
    if (title === 'cyber security' && /\b(cybersecurity|ethical hacking|security)\b/.test(normalizedQuestion)) return true;
    return false;
  });

  if (matchedCourse) {
    return `${matchedCourse.title} is listed as a ${matchedCourse.duration} ${matchedCourse.level.toLowerCase()} course. ${matchedCourse.shortDescription} For the latest batch and fee details, contact admissions.`;
  }

  if (/\b(course|courses|program|programs|training|learn|duration|long)\b/.test(normalizedQuestion)) {
    return `Current courses listed on the website: ${publicCourseCatalog.map(course => `${course.title} (${course.duration})`).join('; ')}. Course formats and details can vary, so contact admissions for current availability.`;
  }

  if (/\b(corporate|enterprise|company|business|team training)\b/.test(normalizedQuestion)) {
    return 'Global Minds Academy lists corporate training and enterprise technology services. Contact the team to discuss your organization’s technologies, learner group and training goals.';
  }

  return 'I can answer questions about courses and durations, practical training, capstone projects, career support, batch schedules, fees, corporate training and academy contact details. Try asking about a specific course or project.';
}

export function QuickContactAssistant() {
  const siteConfig = useSiteConfig();
  const [quickContactsOpen, setQuickContactsOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hello! Welcome to Global Minds Academy. Ask me about courses, practical training, capstone projects, career support, schedules or admissions. Choose a suggested question or type your own.',
    },
  ]);

  const sendQuestion = (text: string) => {
    const trimmedQuestion = text.trim();
    if (!trimmedQuestion) return;
    setMessages(current => [
      ...current,
      { role: 'user', text: trimmedQuestion },
      { role: 'assistant', text: getAssistantResponse(trimmedQuestion, siteConfig) },
    ]);
    setQuestion('');
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
          className="fixed bottom-24 right-4 z-[70] flex max-h-[min(34rem,calc(100vh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card-xl sm:right-6"
        >
          <header className="flex items-center justify-between bg-brand-700 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">Global Minds AI Assistant</h2>
                <p className="text-xs text-white/75">Online · Instant answers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close AI assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-surface-50 p-4" aria-live="polite">
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`max-w-[90%] whitespace-pre-line rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto bg-brand-700 text-white'
                    : 'bg-white text-surface-700 shadow-sm'
                }`}
              >
                {message.text}
              </p>
            ))}
            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                {suggestedQuestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendQuestion(suggestion)}
                    className="block w-full rounded-xl border border-brand-100 bg-white px-3 py-2 text-left text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    💡 {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-surface-100 bg-white p-3">
            <label className="sr-only" htmlFor="assistant-question">Ask about courses, training or projects</label>
            <input
              id="assistant-question"
              value={question}
              onChange={event => setQuestion(event.target.value)}
              placeholder="Ask about courses, training or projects..."
              className="min-w-0 flex-1 rounded-xl border border-surface-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <div className="fixed bottom-24 right-4 z-[70] flex flex-col items-center gap-3 sm:right-6">
        {quickContactsOpen && (
          <>
            <button
              type="button"
              onClick={() => setAssistantOpen(open => !open)}
              aria-label={assistantOpen ? 'Close AI assistant' : 'Open AI assistant'}
              aria-expanded={assistantOpen}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-transform hover:scale-105"
            >
              <Bot className="h-6 w-6" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-surface-950">AI</span>
            </button>
            <a
              href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat on WhatsApp at ${siteConfig.phone}`}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-105"
            >
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label={`Email ${siteConfig.email}`}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg transition-transform hover:scale-105"
            >
              <Mail className="h-6 w-6" aria-hidden="true" />
            </a>
          </>
        )}
        <button
          type="button"
          onClick={() => setQuickContactsOpen(open => !open)}
          aria-label={quickContactsOpen ? 'Close quick contact' : 'Open quick contact'}
          aria-expanded={quickContactsOpen}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-105"
        >
          {quickContactsOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}
