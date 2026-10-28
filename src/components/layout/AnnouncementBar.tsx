import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Megaphone } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { cn } from '../../utils/cn';
import { ShinyText } from '../ui/ShinyText';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();
  const { announcementBar } = siteConfig;

  if (!announcementBar.enabled || dismissed || location.pathname === '/') return null;

  return (
    <div className={cn(
      'bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white relative overflow-hidden',
      location.pathname === '/' && 'home-announcement',
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-4 top-0 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
      </div>

      <div className="container-xl relative">
        <div className="flex items-center justify-between py-2.5 gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Megaphone className="w-4 h-4 flex-shrink-0 opacity-80" />
            <p className="text-sm font-medium truncate">
              <ShinyText text={announcementBar.message} shinyColor="rgba(255, 255, 255, 0.95)" />
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {announcementBar.cta && (
              <Link
                to={announcementBar.ctaHref}
                className={cn(
                  'text-xs font-bold bg-white text-brand-700 px-3 py-1.5',
                  'rounded-full hover:bg-brand-50 transition-colors whitespace-nowrap',
                  location.pathname === '/' && 'home-announcement-cta',
                )}
              >
                {announcementBar.cta}
              </Link>
            )}

            {announcementBar.dismissible && (
              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
