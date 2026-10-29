import { scholarships } from './scholarships';
import { categories } from './categories';
import { masterPrograms } from './masterPrograms';
import { blogPosts } from './blogs';
import { instructors } from './instructors';
import { internships } from './internships';
import { locations } from './locations';
import { testimonials } from './testimonials';
import { courses } from './courses';
import { globalFAQs } from './faqs';
import { defaultNavigation } from './navigationMenu';

const contentRecords = <T extends object>(items: readonly T[]): Record<string, unknown>[] =>
  items.map(item => Object.fromEntries(Object.entries(item)));

export const cmsSections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'courses', label: 'Courses' },
  { id: 'categories', label: 'Categories' },
  { id: 'master-programs', label: 'Master Programs' },
  { id: 'website-menu', label: 'Website Menu' },
  { id: 'live-projects', label: 'Live Projects' },
  { id: 'events', label: 'Events & Webinars' },
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'refer-earn', label: 'Refer & Earn' },
  { id: 'corporate-training', label: 'Corporate Training' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
  { id: 'online-training', label: 'Online Training' },
  { id: 'classroom-training', label: 'Classroom Training' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'demo-class', label: 'Free Demo Class' },
  { id: 'skill-assessment', label: 'Skill Assessment' },
  { id: 'career', label: 'Career & Placement' },
  { id: 'placement-records', label: 'Placement Records' },
  { id: 'interview-preparation', label: 'Interview Preparation' },
  { id: 'mock-interview', label: 'Mock Interview' },
  { id: 'students', label: 'Students' },
  { id: 'instructors', label: 'Instructors' },
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'internships', label: 'Internships' },
  { id: 'batches', label: 'Batches' },
  { id: 'locations', label: 'Locations' },
  { id: 'blog', label: 'Blog' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'payments', label: 'Payments' },
  { id: 'settings', label: 'Settings' },
] as const;

export type CmsSection = (typeof cmsSections)[number]['id'];

export const cmsSeeds: Record<CmsSection, Record<string, unknown>[]> = {
  dashboard: [],
  courses: contentRecords(courses),
  categories: contentRecords(categories),
  'master-programs': contentRecords(masterPrograms),
  'website-menu': [
    {
      slug: 'site-navigation',
      primary: defaultNavigation.primary,
      more: defaultNavigation.more,
    },
  ],
  'live-projects': [],
  events: [],
  scholarships: scholarships.map(scholarship => ({ ...scholarship })),
  'refer-earn': [],
  'corporate-training': [],
  about: [],
  contact: [],
  'online-training': [],
  'classroom-training': [],
  certifications: [],
  'demo-class': [],
  'skill-assessment': [],
  career: [],
  'placement-records': [],
  'interview-preparation': [],
  'mock-interview': [],
  students: [],
  instructors: contentRecords(instructors),
  enquiries: [],
  internships: contentRecords(internships),
  batches: [],
  locations: contentRecords(locations),
  blog: contentRecords(blogPosts),
  faqs: contentRecords(globalFAQs),
  testimonials: contentRecords(testimonials),
  certificates: [],
  payments: [],
  settings: [],
};
