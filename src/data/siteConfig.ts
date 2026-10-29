// ============================================================
// GLOBAL MINDS TECHNOLOGIES — SITE CONFIGURATION
// Real data sourced from globalmindsacademy.in / globalmindstechnologies.com
// ============================================================

export const siteConfig = {
  // ── Brand ──────────────────────────────────────────────────
  brandName: 'Global Minds Technologies',
  brandShortName: 'Global Minds',
  tagline: 'Build Skills Today for Tomorrow\'s Leaders',
  subTagline: 'AWS / Cloud, Data Science, AI & Machine Learning, Full Stack Development, Cyber Security, and Software & Automation Testing.',
  logoText: 'Global Minds Technologies',
  logoUrl: '/logo.png',
  faviconUrl: '/logo.png',
  foundedYear: 2018,

  // ── Contact ────────────────────────────────────────────────
  email: 'connect@globalmindstechnologies.com',
  supportEmail: 'connect@globalmindstechnologies.com',
  admissionsEmail: 'connect@globalmindstechnologies.com',
  phone: '+91 95974 37333',
  phoneAlt: '+91 95974 37333',
  whatsapp: '+919597437333',
  whatsappMessage: 'Hi, I want to know more about Global Minds Technologies courses.',

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
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.globalmindsacademy.in/v1',

  // ── SEO Defaults ──────────────────────────────────────────
  seo: {
    defaultTitle: 'Global Minds Technologies | Build Skills. Own the Future.',
    titleTemplate: '%s | Global Minds Technologies',
    defaultDescription: 'Explore AWS / Cloud, Data Science, AI & Machine Learning, Full Stack Development, Cyber Security, and Software & Automation Testing at Global Minds Technologies. 50+ hiring partners.',
    defaultOgImage: 'https://globalmindsacademy.in/og-image.png',
    twitterHandle: '@globalmindsacad',
  },

  // ── Stats ──────────────────────────────────────────────────
  stats: [
    { id: 's1', label: 'Students Placed', value: '1,000+', numericValue: 1000, suffix: '+', icon: 'users', description: 'Successful careers launched' },
    { id: 's2', label: 'Hiring Partners', value: '50+', numericValue: 50, suffix: '+', icon: 'briefcase', description: 'Top tech enterprises' },
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
      description: 'Global Minds Technologies has 50+ hiring partners.',
    },
    {
      icon: 'layers',
      title: 'Enterprise Capstone Projects',
      description: 'Build impressive GitHub portfolio projects: Spring Boot EMS, AI Healthcare Assistant, Cloud E-Commerce.',
    },
    {
      icon: 'globe',
      title: 'Courses',
      description: 'AWS / Cloud, Data Science, AI & Machine Learning, Full Stack Development, Cyber Security, and Software & Automation Testing.',
    },
  ],

  // ── Announcement Bar ───────────────────────────────────────
  announcementBar: {
    enabled: true,
    message: 'Explore AWS / Cloud, Data Science, AI & Machine Learning, Full Stack Development, Cyber Security, and Software & Automation Testing. 50+ Hiring Partners.',
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
} as const;

export type SiteConfig = typeof siteConfig;
