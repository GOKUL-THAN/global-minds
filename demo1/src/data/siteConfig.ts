// ============================================================
// GLOBAL MINDS ACADEMY — SITE CONFIGURATION
// Real data sourced from globalmindsacademy.in
// ============================================================

const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL;

export const siteConfig = {
  // ── Brand ──────────────────────────────────────────────────
  brandName: 'Global Minds Academy',
  brandShortName: 'GMA',
  tagline: 'Build Skills Today for Tomorrow\'s Leaders',
  subTagline: 'AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing.',
  logoText: 'Global Minds Academy',
  logoUrl: '/logo.png',
  faviconUrl: '/logo.png',
  foundedYear: 2018,

  // ── Contact ────────────────────────────────────────────────
  email: 'globalminds.learn@gmail.com',
  supportEmail: 'support@globalmindsacademy.in',
  admissionsEmail: 'admissions@globalmindsacademy.in',
  phone: '+91 95974 37333',
  phoneAlt: '+91 95974 37333',
  whatsapp: '+919597437333',
  whatsappMessage: 'Hi, I want to know more about Global Minds Academy courses.',

  // ── Address ────────────────────────────────────────────────
  address: {
    line1: 'Nookampalayam Road, Perumbakkam',
    line2: 'Chennai – 600 100',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600100',
  },

  // ── Business Hours ─────────────────────────────────────────
  businessHours: 'Mon – Sat: 9:00 AM – 7:00 PM IST',
  supportHours: '24/7 Online Support',

  // ── Social Links ───────────────────────────────────────────
  socialLinks: {
    linkedin: 'https://linkedin.com/company/globalmindsacademy',
    twitter: 'https://twitter.com/globalmindsacad',
    facebook: 'https://facebook.com/globalmindsacademy',
    youtube: 'https://youtube.com/@globalmindsacademy',
    instagram: 'https://instagram.com/globalmindsacademy',
    github: 'https://github.com/globalmindsacademy',
    telegram: 'https://t.me/globalmindsacademy',
  },

  // ── URLs ───────────────────────────────────────────────────
  siteUrl: 'https://globalmindsacademy.in',
  apiBaseUrl: configuredApiBaseUrl || 'https://api.globalmindsacademy.in/v1',

  // ── SEO Defaults ──────────────────────────────────────────
  seo: {
    defaultTitle: 'Global Minds Academy | Build Skills. Own the Future.',
    titleTemplate: '%s | Global Minds Academy',
    defaultDescription: 'Explore AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing at Global Minds Academy. 50+ hiring partners.',
    defaultOgImage: 'https://globalmindsacademy.in/og-image.jpg',
    twitterHandle: '@globalmindsacad',
  },

  // ── Stats ──────────────────────────────────────────────────
  stats: [
    { id: 's1', label: 'Graduates Trained', value: '15,000+', numericValue: 15000, suffix: '+', icon: 'users', description: 'Across 25+ countries' },
    { id: 's2', label: 'Hiring Partners', value: '50+', numericValue: 50, suffix: '+', icon: 'briefcase', description: 'Top tech enterprises' },
    { id: 's3', label: 'Student Rating', value: '4.9/5.0', numericValue: 4.9, suffix: '', icon: 'star', description: 'From 8,000+ reviews' },
    { id: 's4', label: 'Placement Success', value: '98.4%', numericValue: 98.4, suffix: '%', icon: 'award', description: 'Within 6 months' },
    { id: 's5', label: 'Countries Reached', value: '25+', numericValue: 25, suffix: '+', icon: 'globe', description: 'India, US, Europe, Asia' },
    { id: 's6', label: 'Master Programs', value: '5', numericValue: 5, suffix: '', icon: 'book-open', description: 'Comprehensive career tracks' },
  ],

  // ── Countries (for global reach section & forms) ───────────
  countries: [
    { name: 'India', code: 'IN', flag: '🇮🇳' },
    { name: 'USA', code: 'US', flag: '🇺🇸' },
    { name: 'UK', code: 'GB', flag: '🇬🇧' },
    { name: 'Canada', code: 'CA', flag: '🇨🇦' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺' },
    { name: 'UAE', code: 'AE', flag: '🇦🇪' },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
    { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪' },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱' },
    { name: 'Other', code: 'XX', flag: '🌍' },
  ],

  // ── Currencies ─────────────────────────────────────────────
  currencies: [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  ],

  // ── Why Us — real GMA differentiators ─────────────────────
  whyUs: [
    {
      icon: 'flask',
      title: '100% Practical Labs',
      description: 'Every session includes hands-on lab work with real enterprise tools — no theory-only classes.',
    },
    {
      icon: 'graduation-cap',
      title: 'Global Certification',
      description: '50+ hiring partners.',
    },
    {
      icon: 'user',
      title: '1-on-1 Mentorship',
      description: 'Dedicated personal mentors — senior software architects and AI researchers guide your learning journey.',
    },
    {
      icon: 'briefcase',
      title: '50+ Hiring Partners',
      description: 'Global Minds Academy has 50+ hiring partners.',
    },
    {
      icon: 'layers',
      title: 'Enterprise Capstone Projects',
      description: 'Build impressive GitHub portfolio projects: Spring Boot EMS, AI Healthcare Assistant, Cloud E-Commerce.',
    },
    {
      icon: 'globe',
      title: 'Courses',
      description: 'AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing.',
    },
  ],

  // ── Announcement Bar ───────────────────────────────────────
  announcementBar: {
    enabled: true,
    message: 'Explore AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing. 50+ Hiring Partners.',
    cta: 'Register Now',
    ctaHref: '/batch-schedule',
    dismissible: true,
  },

  // ── Feature Flags ─────────────────────────────────────────
  features: {
    payments: false,
    googleLogin: false,
    chatSupport: false,
    liveClasses: true,
    coursePreviewVideo: true,
    newsletter: true,
    blog: true,
  },
};

export type SiteConfig = typeof siteConfig;
