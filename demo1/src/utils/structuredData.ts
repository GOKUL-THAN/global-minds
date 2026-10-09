/**
 * JSON-LD Structured Data helpers for SEO.
 * Inject these into the document head on the relevant pages.
 */

import { siteConfig } from '../data/siteConfig';
import type { Course, BlogPost } from '../types';

/** Organization schema (used on every page via index.html) */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: siteConfig.brandName,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/logo.png`,
    description: siteConfig.seo.defaultDescription,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      addressCountry: siteConfig.address.country,
    },
    sameAs: Object.values(siteConfig.socialLinks),
  };
}

/** Course schema for individual course pages */
export function courseSchema(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription,
    provider: {
      '@type': 'EducationalOrganization',
      name: siteConfig.brandName,
      url: siteConfig.siteUrl,
    },
    url: `${siteConfig.siteUrl}/courses/${course.slug}`,
    image: course.thumbnail,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      reviewCount: course.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      price: course.discountPrice,
      priceCurrency: course.currency,
      availability: 'https://schema.org/InStock',
    },
    timeRequired: `PT${course.totalHours}H`,
    educationalLevel: course.level,
    inLanguage: course.language,
  };
}

/** FAQPage schema */
export function faqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** BreadcrumbList schema */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Article schema for blog posts */
export function articleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.brandName,
      url: siteConfig.siteUrl,
    },
    datePublished: post.publishedAt,
    url: `${siteConfig.siteUrl}/blog/${post.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.siteUrl}/blog/${post.slug}`,
    },
  };
}

/** Inject a JSON-LD script into the document head */
export function injectStructuredData(data: object, id: string) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data, null, 2);
  document.head.appendChild(script);
}
