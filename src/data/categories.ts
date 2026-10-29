import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'cat-cloud',
    slug: 'cloud-computing',
    title: 'AWS / Cloud',
    description: 'Cloud architecture, infrastructure as code, serverless compute, and AWS enterprise solutions.',
    icon: 'cloud',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    courseCount: 1,
    courses: ['aws-training'],
    featured: true,
    order: 1,
  },
  {
    id: 'cat-data',
    slug: 'data-science-analytics',
    title: 'Data Science',
    description: 'Python, statistical analysis, machine learning algorithms, and enterprise business intelligence.',
    icon: 'bar-chart-2',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    courseCount: 1,
    courses: ['data-science'],
    featured: true,
    order: 2,
  },
  {
    id: 'cat-ai-ml',
    slug: 'artificial-intelligence',
    title: 'AI & Machine Learning',
    description: 'Deep neural networks, computer vision, natural language processing, LLMs, and Generative AI.',
    icon: 'cpu',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    courseCount: 3,
    courses: ['ai-ml-engineering', 'machine-learning', 'generative-ai'],
    featured: true,
    order: 3,
  },
  {
    id: 'cat-fullstack',
    slug: 'full-stack-development',
    title: 'Full Stack Development',
    description: 'Modern front-end and back-end development with React, Node.js, databases, and cloud deployment.',
    icon: 'layers',
    color: '#10b981',
    bgColor: '#ecfdf5',
    courseCount: 1,
    courses: ['full-stack-development'],
    featured: true,
    order: 4,
  },
  {
    id: 'cat-cyber',
    slug: 'cyber-security',
    title: 'Cyber Security',
    description: 'Hands-on ethical hacking, penetration testing, network defense, SIEM, and vulnerability analysis.',
    icon: 'shield',
    color: '#ef4444',
    bgColor: '#fef2f2',
    courseCount: 1,
    courses: ['cyber-security'],
    featured: true,
    order: 5,
  },
  {
    id: 'cat-testing',
    slug: 'software-and-automation-testing',
    title: 'Software & Automation Testing',
    description: 'Unified manual testing, Selenium WebDriver, Cypress, API automation with Postman, and CI/CD pipelines.',
    icon: 'check-circle',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    courseCount: 1,
    courses: ['software-and-automation-testing'],
    featured: true,
    order: 6,
  },
  {
    id: 'cat-bridge',
    slug: 'career-development',
    title: 'Bridge & Language Courses',
    description: 'Campus-to-corporate transitional training, workplace communications, and professional English mastery.',
    icon: 'zap',
    color: '#f97316',
    bgColor: '#fff7ed',
    courseCount: 2,
    courses: ['campus-to-corporate-bridge-course', 'tech-communication-language'],
    featured: true,
    order: 7,
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  // Alias mapping for backwards compatibility and merged courses
  if (slug === 'software-testing' || slug === 'automation-testing') {
    return categories.find(c => c.slug === 'software-and-automation-testing');
  }
  if (slug === 'machine-learning') {
    return categories.find(c => c.slug === 'artificial-intelligence');
  }
  return categories.find(c => c.slug === slug);
};

export const getFeaturedCategories = () => categories.filter(c => c.featured).sort((a, b) => a.order - b.order);
