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
    shortDescription: 'Master Python, statistics, AIML concepts, data visualisation and SQL to build a data science career.',
    duration: '16 Weeks',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 1340,
  },
  {
    sourceSlug: 'data-analytics',
    title: 'Data Analytics',
    category: 'data-analytics',
    subCategory: 'Analytics',
    shortDescription: 'Analyse, visualise and communicate business insights using Excel, SQL, Python, Power BI and Tableau.',
    duration: '12 Weeks',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 1100,
  },
  {
    sourceSlug: 'python',
    title: 'Python',
    category: 'python',
    subCategory: 'Programming',
    shortDescription: 'Learn Python fundamentals, object-oriented programming, APIs, databases and real-world applications.',
    duration: '10 Weeks',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 1250,
  },
  {
    sourceSlug: 'generative-ai',
    title: 'Gen AI / Agent AI',
    category: 'gen-ai-agent-ai',
    subCategory: 'Generative & Agent AI',
    shortDescription: 'Build LLM applications, RAG pipelines, prompt workflows and autonomous AI agents.',
    duration: '10 Weeks',
    level: 'Intermediate',
    featured: true,
    trending: true,
    learnerCount: 870,
  },
  {
    sourceSlug: 'ai-data-science',
    title: 'AIDS',
    category: 'ai-data-science',
    subCategory: 'AI & Data Science',
    shortDescription: 'Combine data science, analytics, Python, AI techniques and data visualisation for end-to-end projects.',
    duration: '16 Weeks',
    level: 'Intermediate',
    featured: true,
    trending: true,
    learnerCount: 920,
  },
  {
    sourceSlug: 'aiml',
    title: 'AIML',
    category: 'aiml',
    subCategory: 'AIML',
    shortDescription: 'Study AIML models, deep learning, NLP and model deployment through practical projects.',
    duration: '16 Weeks',
    level: 'Intermediate',
    featured: true,
    trending: true,
    learnerCount: 980,
  },
  {
    sourceSlug: 'digital-marketing',
    title: 'Digital Marketing',
    category: 'digital-marketing',
    subCategory: 'Marketing',
    shortDescription: 'Learn SEO, performance advertising, social media, content strategy, analytics and conversion optimisation.',
    duration: '12 Weeks',
    level: 'Beginner',
    featured: true,
    popular: true,
    learnerCount: 1050,
  },
  {
    sourceSlug: 'software-testing',
    title: 'Software Testing',
    category: 'software-testing',
    subCategory: 'Software Testing',
    shortDescription: 'Master manual testing, automation testing with Selenium, API testing, performance testing and Agile QA practices.',
    duration: '12 Weeks',
    level: 'Beginner',
    popular: true,
    learnerCount: 1320,
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
