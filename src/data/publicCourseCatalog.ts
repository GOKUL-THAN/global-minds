import type { Course, CourseLevel } from '../types';

export interface PublicCourseListing {
  sourceSlug: string;
  title: string;
  category: string;
  subCategory: string;
  shortDescription: string;
  duration: string;
  level: CourseLevel;
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  learnerCount?: number;
}

export const publicCourseCatalog: PublicCourseListing[] = [
  {
    sourceSlug: 'data-science',
    title: 'Data Science',
    category: 'data-science-analytics',
    subCategory: 'Data Science',
    shortDescription: 'Master Python, statistics, machine learning, data visualisation and SQL to build a data science career.',
    duration: '4 Months',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 1340,
  },
  {
    sourceSlug: 'ai-ml-engineering',
    title: 'AI & Machine Learning Engineering',
    category: 'artificial-intelligence',
    subCategory: 'Artificial Intelligence',
    shortDescription: 'Deep learning, computer vision, natural language processing, LLMs, and enterprise AI system deployment.',
    duration: '4 Months',
    level: 'Intermediate',
    featured: true,
    trending: true,
    learnerCount: 1120,
  },
  {
    sourceSlug: 'machine-learning',
    title: 'Machine Learning',
    category: 'artificial-intelligence',
    subCategory: 'Machine Learning',
    shortDescription: 'Build ML models, deep learning systems and deploy AI applications with Python, TensorFlow and PyTorch.',
    duration: '3 Months',
    level: 'Intermediate',
    featured: true,
    trending: true,
    learnerCount: 980,
  },
  {
    sourceSlug: 'software-and-automation-testing',
    title: 'Software & Automation Testing',
    category: 'software-and-automation-testing',
    subCategory: 'Software Testing',
    shortDescription: 'Unified manual testing, Selenium WebDriver, Cypress, API automation with Postman, and CI/CD quality engineering.',
    duration: '3 Months',
    level: 'Beginner',
    popular: true,
    featured: true,
    learnerCount: 1450,
  },
  {
    sourceSlug: 'software-testing',
    title: 'Software & Automation Testing',
    category: 'software-and-automation-testing',
    subCategory: 'Software Testing',
    shortDescription: 'Unified manual testing, Selenium WebDriver, Cypress, API automation with Postman, and CI/CD quality engineering.',
    duration: '3 Months',
    level: 'Beginner',
    popular: true,
    learnerCount: 1450,
  },
  {
    sourceSlug: 'automation-testing',
    title: 'Software & Automation Testing',
    category: 'software-and-automation-testing',
    subCategory: 'Automation Testing',
    shortDescription: 'Unified manual testing, Selenium WebDriver, Cypress, API automation with Postman, and CI/CD quality engineering.',
    duration: '3 Months',
    level: 'Intermediate',
    popular: true,
    learnerCount: 1450,
  },
  {
    sourceSlug: 'aws-training',
    title: 'AWS / Cloud',
    category: 'cloud-computing',
    subCategory: 'Cloud',
    shortDescription: 'Master AWS core services — EC2, S3, VPC, IAM, Lambda, RDS, serverless and infrastructure as code.',
    duration: '3 Months',
    level: 'Intermediate',
    featured: true,
    trending: true,
    popular: true,
    learnerCount: 1150,
  },
  {
    sourceSlug: 'full-stack-development',
    title: 'Full Stack Development',
    category: 'full-stack-development',
    subCategory: 'Full Stack',
    shortDescription: 'Build complete web applications with React, Node.js, Express, MongoDB, PostgreSQL and cloud deployment.',
    duration: '4 Months',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 1600,
  },
  {
    sourceSlug: 'cyber-security',
    title: 'Cyber Security',
    category: 'cyber-security',
    subCategory: 'Security',
    shortDescription: 'Hands-on ethical hacking, penetration testing, network defence, SOC operations and cloud security protocols.',
    duration: '3 Months',
    level: 'Intermediate',
    featured: true,
    learnerCount: 750,
  },
  {
    sourceSlug: 'campus-to-corporate-bridge-course',
    title: 'Campus-to-Corporate Bridge Program',
    category: 'career-development',
    subCategory: 'Bridge Course',
    shortDescription: 'Fast-track transition from campus graduate to enterprise-ready engineer with Git, agile practices, and corporate etiquette.',
    duration: '2 Months',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 890,
  },
  {
    sourceSlug: 'tech-communication-language',
    title: 'Professional Tech Communication & Language',
    category: 'career-development',
    subCategory: 'Language & Communication',
    shortDescription: 'Master professional technical English, stakeholder presentations, interview fluency, and executive communication.',
    duration: '2 Months',
    level: 'Beginner',
    featured: false,
    popular: true,
    learnerCount: 640,
  },
];

export function applyPublicCourseListing(course: Course, listing: PublicCourseListing): Course {
  return {
    ...course,
    title: listing.title,
    category: listing.category,
    subCategory: listing.subCategory,
    shortDescription: listing.shortDescription,
    duration: listing.duration,
    level: listing.level,
    featured: listing.featured ?? false,
    trending: listing.trending ?? false,
    popular: listing.popular ?? false,
    learnerCount: listing.learnerCount ?? course.learnerCount,
  };
}
