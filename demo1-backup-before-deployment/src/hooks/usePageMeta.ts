import { useEffect } from 'react';
import { useSiteConfig } from '../contexts/SiteConfigContext';

interface PageMetaOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noIndex?: boolean;
}

/**
 * Sets document.title and meta tags for each page.
 * In production, replace this with a proper head-management library
 * (e.g. react-helmet-async) once SSR/SSG is introduced.
 */
export function usePageMeta({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonical,
  noIndex = false,
}: PageMetaOptions = {}) {
  const siteConfig = useSiteConfig();
  useEffect(() => {
    const fullTitle = title
      ? siteConfig.seo.titleTemplate.replace('%s', title)
      : siteConfig.seo.defaultTitle;

    const metaDescription = description || siteConfig.seo.defaultDescription;
    const image = ogImage || siteConfig.seo.defaultOgImage;
    const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');

    // Title
    document.title = fullTitle;

    // Helpers
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard meta
    setMeta('description', metaDescription);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', metaDescription, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:url', canonicalUrl, 'property');

    // Twitter Card
    setMeta('twitter:title', fullTitle, 'name');
    setMeta('twitter:description', metaDescription, 'name');
    setMeta('twitter:image', image, 'name');

    // Canonical
    setLink('canonical', canonicalUrl);
  }, [title, description, ogImage, ogType, canonical, noIndex]);
}
