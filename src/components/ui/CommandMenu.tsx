import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Sparkles, Phone, MessageCircle, Calendar,
  Award, Shield, FileText, ArrowRight, X, Compass, ExternalLink,
} from 'lucide-react';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';
import { siteConfig } from '../../data/siteConfig';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'Courses' | 'Navigation' | 'Direct Actions' | 'Support';
  action: () => void;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setOpen(current => !current);
      }
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Direct Actions
      {
        id: 'action-demo',
        title: 'Book a Free Demo Class',
        description: 'Experience a live interactive session with our mentors',
        icon: Sparkles,
        category: 'Direct Actions',
        action: () => { setOpen(false); navigate('/demo-class'); },
      },
      {
        id: 'action-schedule',
        title: 'Check Upcoming Batch Schedule',
        description: 'Weekday morning, evening, and weekend timings',
        icon: Calendar,
        category: 'Direct Actions',
        action: () => { setOpen(false); navigate('/batch-schedule'); },
      },
      {
        id: 'action-scholarship',
        title: 'Apply for Scholarship Grant',
        description: 'Up to 40% fee waiver based on evaluation',
        icon: Award,
        category: 'Direct Actions',
        action: () => { setOpen(false); navigate('/scholarships'); },
      },
      {
        id: 'action-whatsapp',
        title: 'Chat on WhatsApp',
        description: `Direct conversation with admissions (${siteConfig.phone})`,
        icon: MessageCircle,
        category: 'Support',
        action: () => {
          setOpen(false);
          window.open(`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`, '_blank');
        },
      },
      {
        id: 'action-call',
        title: 'Call Admissions Hotline',
        description: `Speak directly with career counselors (${siteConfig.phone})`,
        icon: Phone,
        category: 'Support',
        action: () => {
          setOpen(false);
          window.location.href = `tel:${siteConfig.phone}`;
        },
      },
      // Navigation
      {
        id: 'nav-courses',
        title: 'Explore All Courses',
        description: 'Complete directory of 7+ technology tracks',
        icon: Compass,
        category: 'Navigation',
        action: () => { setOpen(false); navigate('/courses'); },
      },
      {
        id: 'nav-master',
        title: 'Master Programs (6 Months)',
        description: 'Full-stack career transformation tracks',
        icon: Award,
        category: 'Navigation',
        action: () => { setOpen(false); navigate('/master-programs'); },
      },
      {
        id: 'nav-projects',
        title: 'Live Capstone Projects',
        description: 'Enterprise projects with source repositories',
        icon: FileText,
        category: 'Navigation',
        action: () => { setOpen(false); navigate('/live-projects'); },
      },
      {
        id: 'nav-placements',
        title: 'Placement Records & Alumni',
        description: 'Verified student placement stats up to 14 LPA',
        icon: Shield,
        category: 'Navigation',
        action: () => { setOpen(false); navigate('/placement'); },
      },
    ];

    // Add Course Catalog dynamically
    publicCourseCatalog.forEach(course => {
      list.push({
        id: `course-${course.sourceSlug}`,
        title: course.title,
        description: `${course.duration} ${course.level} program · ${course.shortDescription}`,
        icon: BookOpen,
        category: 'Courses',
        action: () => { setOpen(false); navigate(`/courses/${course.sourceSlug}`); },
      });
    });

    return list;
  }, [navigate]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    );
  }, [items, query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search and Quick Commands"
      className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-20 sm:pt-28 bg-slate-900/60 backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-2xl transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-surface-100 px-4 py-3.5">
          <Search className="h-5 w-5 text-brand-600 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search courses, syllabi, admissions, or jump to page... (Esc to close)"
            className="w-full bg-transparent px-3 text-base text-surface-900 placeholder:text-surface-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700"
            aria-label="Close command palette"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-surface-500">
              <p className="text-sm">No results found for "{query}".</p>
              <p className="mt-1 text-xs text-surface-400">Try searching "AWS", "Full Stack", "Demo", or "Scholarship"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left transition-colors hover:bg-brand-50/80 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-brand-700 group-hover:bg-brand-100 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-surface-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                      <span className="rounded-lg bg-surface-100 px-2 py-0.5 text-[10px] font-bold text-surface-600">
                        {item.category}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-surface-100 bg-surface-50 px-4 py-2.5 text-xs text-surface-500 font-medium">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="rounded border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold">↑</kbd> <kbd className="rounded border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold">↓</kbd></span>
            <span>Select: <kbd className="rounded border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold">↵</kbd></span>
          </div>
          <span>Press <kbd className="rounded border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold">Ctrl+K</kbd> anytime</span>
        </div>
      </div>
    </div>
  );
}

