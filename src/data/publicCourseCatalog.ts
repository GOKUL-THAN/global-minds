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
    duration: '16 Weeks',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 1340,
  },
  {
    sourceSlug: 'machine-learning',
    title: 'Machine Learning',
    category: 'artificial-intelligence',
    subCategory: 'Machine Learning',
    shortDescription: 'Build ML models, deep learning systems and deploy AI applications with Python, TensorFlow and PyTorch.',
    duration: '14 Weeks',
    level: 'Intermediate',
    featured: true,
    trending: true,
    learnerCount: 980,
  },
  {
    sourceSlug: 'software-testing',
    title: 'Software Testing',
    category: 'software-testing',
    subCategory: 'Software Testing',
    shortDescription: 'Master manual testing, SDLC, test planning, bug reporting and Agile QA practices with JIRA.',
    duration: '10 Weeks',
    level: 'Beginner',
    popular: true,
    learnerCount: 1320,
  },
  {
    sourceSlug: 'automation-testing',
    title: 'Automation Testing',
    category: 'automation-testing',
    subCategory: 'Automation Testing',
    shortDescription: 'Automate web testing with Selenium, Cypress, TestNG, API testing with Postman and CI/CD integration.',
    duration: '12 Weeks',
    level: 'Intermediate',
    featured: true,
    learnerCount: 1100,
  },
  {
    sourceSlug: 'aws-training',
    title: 'AWS / Cloud',
    category: 'cloud-computing',
    subCategory: 'Cloud',
    shortDescription: 'Master AWS core services — EC2, S3, VPC, IAM, Lambda, RDS, serverless and infrastructure as code.',
    duration: '10 Weeks',
    level: 'Intermediate',
    featured: true,
    trending: true,
    popular: true,
    learnerCount: 1150,
  },
  {
    sourceSlug: 'generative-ai',
    title: 'Generative AI',
    category: 'artificial-intelligence',
    subCategory: 'Generative AI',
    shortDescription: 'Build LLM applications, master prompt engineering, RAG pipelines, LangChain, AI agents and fine-tuning with OpenAI and HuggingFace.',
    duration: '10 Weeks',
    level: 'Intermediate',
    featured: true,
    trending: true,
    learnerCount: 870,
  },
  {
    sourceSlug: 'full-stack-development',
    title: 'Full Stack Development',
    category: 'full-stack-development',
    subCategory: 'Full Stack',
    shortDescription: 'Build complete web applications with React, Node.js, Express, MongoDB, PostgreSQL and cloud deployment.',
    duration: '20 Weeks',
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
    duration: '14 Weeks',
    level: 'Intermediate',
    featured: true,
    learnerCount: 750,
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
    status: 'active',
  };
}
