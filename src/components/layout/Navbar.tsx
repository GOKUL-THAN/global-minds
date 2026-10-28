import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Home, Menu, Search, User, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { siteConfig } from '../../data/siteConfig';
import { defaultNavigation, readNavigationContent, type MenuItem, type NavigationContent } from '../../data/navigationMenu';
import { cmsService } from '../../services/cmsService';
import { Button } from '../ui/Button';
import { SpotlightCard } from '../ui/SpotlightCard';
import { Magnetic } from '../ui/Magnetic';

const navigationSlug = 'site-navigation';

function SiteLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (/^https:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>{children}</a>;
  }
  return <Link to={href} className={className} onClick={onClick}>{children}</Link>;
}

function MenuImage({ src, className }: { src: string; className?: string }) {
  if (!src.startsWith('data:image/')) return null;
  return <img src={src} alt="" className={className} />;
}

function ordered<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.order - right.order);
}

export function Navbar() {
  const [navigation, setNavigation] = useState<NavigationContent>(defaultNavigation);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const primaryItems = ordered(navigation.primary.filter(item => item.visible));
  const moreItems = ordered(navigation.more.filter(item => item.visible));

  useEffect(() => {
    let active = true;
    void cmsService.getPublic('website-menu').then(records => {
      const record = records.find(item => item.slug === navigationSlug);
      if (!record || record.status !== 'published') return;
      const content = readNavigationContent(record.content);
      if (!content) {
        console.error('The published website navigation record has an invalid structure.');
        return;
      }
      // Force Colleges to be a simple direct link (no dropdown)
      content.primary = content.primary.map(item =>
        item.id === 'colleges' ? { ...item, children: [] } : item,
      );
      if (active) setNavigation(content);
    }).catch(cause => {
      console.error('Unable to load the published website navigation. The default navigation remains available.', cause);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
    setOpenDropdown(null);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenDropdown(null);
      setMoreMenuOpen(false);
      if (mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileMenuRef.current?.querySelector<HTMLElement>('a, button')?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isRouteActive = (href: string) => href.startsWith('/')
    && (location.pathname === href || location.pathname.startsWith(`${href}/`)
      || (href === '/courses' && location.pathname.startsWith('/categories/')));

  const renderDesktopItem = (item: MenuItem) => {
    const active = isRouteActive(item.href);
    const hasChildren = item.children.some(child => child.visible);
    const buttonStyle = active
      ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700'
      : 'text-surface-700 hover:text-brand-600 hover:bg-brand-50';
    if (!hasChildren) {
      return (
        <SiteLink
          key={item.id}
          href={item.href}
          className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', buttonStyle)}
        >
          <MenuImage src={item.icon} className="h-5 w-5 rounded object-contain" />
          {item.label}
        </SiteLink>
      );
    }

    const isOpen = openDropdown === item.id;
    return (
      <div key={item.id} className="relative flex items-center">
        {/* Label + chevron as one unified button — no navigation, just toggles dropdown */}
        <button
          type="button"
          onClick={() => { setOpenDropdown(isOpen ? null : item.id); setMoreMenuOpen(false); }}
          onMouseEnter={() => { setOpenDropdown(item.id); setMoreMenuOpen(false); }}
          className={cn('flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors', buttonStyle, isOpen && !active && 'bg-brand-50 text-brand-700')}
          aria-label={`Open ${item.label} submenu`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-controls={`submenu-${item.id}`}
        >
          <MenuImage src={item.icon} className="h-5 w-5 rounded object-contain" />
          {item.label}
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
        {isOpen && (() => {
          const visibleChildren = ordered(item.children.filter(child => child.visible));
          // Check if children have group labels for mega-menu layout
          const groups = new Map<string, typeof visibleChildren>();
          const hasGroups = visibleChildren.some(child => child.group);
          if (hasGroups) {
            for (const child of visibleChildren) {
              const groupName = child.group || 'Other';
              if (!groups.has(groupName)) groups.set(groupName, []);
              groups.get(groupName)!.push(child);
            }
          }
          return hasGroups ? (
            <div
              id={`submenu-${item.id}`}
              className="absolute right-0 top-full z-50 mt-2 max-h-[min(70vh,40rem)] overflow-y-auto rounded-xl border border-surface-100 bg-white p-4 shadow-card-lg"
              style={{ width: `${Math.min(groups.size, 4) * 210 + 32}px`, maxWidth: '90vw' }}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(groups.size, 4)}, 1fr)` }}>
                {Array.from(groups.entries()).map(([groupName, groupChildren]) => (
                  <div key={groupName}>
                    <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-brand-800">{groupName}</p>
                    <div className="space-y-0.5">
                      {groupChildren.map(child => (
                        <SiteLink
                          key={child.id}
                          href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] text-surface-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          <MenuImage src={child.icon} className="h-4 w-4 rounded object-contain" />
                          {child.label}
                        </SiteLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              id={`submenu-${item.id}`}
              className="absolute left-0 top-full z-50 mt-2 max-h-[min(70vh,36rem)] w-80 max-w-[90vw] overflow-y-auto rounded-xl border border-surface-100 bg-white p-2 shadow-card-lg"
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-surface-800">{item.label}</p>
              {visibleChildren.map(child => (
                <SiteLink
                  key={child.id}
                  href={child.href}
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-surface-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  <MenuImage src={child.icon} className="h-5 w-5 rounded object-contain" />
                  {child.label}
                </SiteLink>
              ))}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderMobileItem = (item: MenuItem) => {
    const active = isRouteActive(item.href);
    const children = ordered(item.children.filter(child => child.visible));
    const expanded = mobileExpanded === item.id;
    return (
      <div key={item.id}>
        <div className="flex items-center">
          <SiteLink
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex flex-1 items-center gap-2 rounded-xl p-3 font-semibold hover:bg-surface-50',
              active ? 'bg-brand-50 text-brand-700' : 'text-surface-900',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <MenuImage src={item.icon} className="h-5 w-5 rounded object-contain" />
            {item.label}
          </SiteLink>
          {children.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileExpanded(expanded ? null : item.id)}
              className="rounded-xl p-3 text-surface-600 hover:bg-surface-50"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label} submenu`}
              aria-expanded={expanded}
            >
              <ChevronDown className={cn('h-5 w-5 transition-transform', expanded && 'rotate-180')} />
            </button>
          )}
        </div>
        {expanded && children.length > 0 && (() => {
          const hasGroups = children.some(child => child.group);
          if (hasGroups) {
            const groups = new Map<string, typeof children>();
            for (const child of children) {
              const groupName = child.group || 'Other';
              if (!groups.has(groupName)) groups.set(groupName, []);
              groups.get(groupName)!.push(child);
            }
            return (
              <div className="ml-4 mt-1 space-y-3 border-l-2 border-brand-100 pl-4">
                {Array.from(groups.entries()).map(([groupName, groupChildren]) => (
                  <div key={groupName}>
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-600">{groupName}</p>
                    <div className="space-y-0.5">
                      {groupChildren.map(child => (
                        <SiteLink
                          key={child.id}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-lg p-2.5 text-sm text-surface-700 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <MenuImage src={child.icon} className="h-4 w-4 rounded object-contain" />
                          {child.label}
                        </SiteLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-brand-100 pl-4">
              {children.map(child => (
                <SiteLink
                  key={child.id}
                  href={child.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-sm text-surface-700 hover:bg-brand-50 hover:text-brand-600"
                >
                  <MenuImage src={child.icon} className="h-4 w-4 rounded object-contain" />
                  {child.label}
                </SiteLink>
              ))}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-50 border-b border-surface-100 transition-colors duration-200',
        location.pathname === '/' && 'home-navbar',
        mobileOpen && 'mobile-menu-open',
        scrolled ? 'bg-white shadow-card' : 'bg-white',
      )}
    >
      <div className="mx-auto max-w-screen-2xl px-2 sm:px-3 lg:px-4">
        <div className="flex h-16 items-center justify-between lg:h-18">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Global Minds Academy home">
            <img
              src={siteConfig.logoUrl}
              alt="Global Minds Academy logo"
              className="h-14 w-14 shrink-0 object-contain"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="whitespace-nowrap font-display text-base font-extrabold tracking-tight sm:text-lg">
              <span className="text-[#164e59]">Global</span>{' '}
              <span className="text-[#176c73]">Minds Academy</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 xl:flex 2xl:gap-3 ml-8" aria-label="Main navigation">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === '/'
                  ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700'
                  : 'text-surface-700 hover:text-brand-600 hover:bg-brand-50',
              )}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            {primaryItems.map(renderDesktopItem)}
            {moreItems.length > 0 && (
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(value => !value);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-brand-50 hover:text-brand-600',
                    moreMenuOpen && 'bg-brand-50 text-brand-700',
                  )}
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                  aria-controls="submenu-more"
                >
                  More
                  <ChevronDown className={cn('h-4 w-4 transition-transform', moreMenuOpen && 'rotate-180')} />
                </button>
                {moreMenuOpen && (
                  <div
                    id="submenu-more"
                    className="absolute right-0 top-full z-50 mt-2 max-h-[min(70vh,36rem)] w-64 max-w-[90vw] overflow-y-auto rounded-xl border border-surface-100 bg-white p-2 shadow-card-lg"
                    onMouseLeave={() => setMoreMenuOpen(false)}
                  >
                    {ordered(moreItems).map(item => (
                      <SiteLink
                        key={item.id}
                        href={item.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-surface-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                      >
                        <MenuImage src={item.icon} className="h-5 w-5 rounded object-contain" />
                        {item.label}
                      </SiteLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Desktop CTA — Search + Login */}
          <div className="hidden items-center gap-2 xl:flex 2xl:gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 rounded-lg p-2 text-surface-700 font-medium transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Search courses"
            >
              <Search className="h-5 w-5" />
              <span className="hidden text-sm 2xl:inline">Search</span>
            </Link>
            <Link to="/login">
              <Magnetic>
                <Button variant="ghost" size="sm" leftIcon={<User className="h-4 w-4" />}>Login</Button>
              </Magnetic>
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen(value => !value)}
            className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 xl:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-surface-950/40 xl:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          />
          <div
            id="public-mobile-menu"
            ref={mobileMenuRef}
            className="reactbits-mobile-menu fixed bottom-0 right-0 top-16 z-50 w-full max-w-md overflow-y-auto bg-white shadow-card-lg xl:hidden"
            onKeyDown={event => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setMobileOpen(false);
                menuButtonRef.current?.focus();
                return;
              }
              if (event.key !== 'Tab' || !mobileMenuRef.current) return;
              const focusable = Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])',
              ));
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
          >
            <div className="container-xl space-y-1 py-4">
              <Link
                to="/courses"
                onClick={() => setMobileOpen(false)}
                className="mb-4 flex items-center gap-3 rounded-xl bg-surface-50 p-3 text-surface-700 font-medium border border-surface-200"
              >
                <Search className="h-5 w-5" />
                <span className="text-sm">Search courses...</span>
              </Link>
              <nav aria-label="Mobile navigation" className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl p-3 font-semibold hover:bg-surface-50',
                    location.pathname === '/' ? 'bg-brand-50 text-brand-700' : 'text-surface-900',
                  )}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                {primaryItems.map(renderMobileItem)}
                {moreItems.length > 0 && (
                  <section className="pt-3">
                    <h2 className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-surface-800">More</h2>
                    {moreItems.map(renderMobileItem)}
                  </section>
                )}
              </nav>
              <div className="mt-6 space-y-3 border-t border-surface-100 pt-4">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block">
                  <Button variant="secondary" size="lg" fullWidth leftIcon={<User className="h-4 w-4" />}>Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
