// ============================================================
// Global Minds Academy — CORE TYPE DEFINITIONS
// ============================================================

// ── Course ──────────────────────────────────────────────────
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type TrainingMode = 'Online' | 'Classroom' | 'Both' | 'Corporate';
export type CourseStatus = 'active' | 'draft' | 'coming-soon' | 'archived';
export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'CAD' | 'AUD';

export interface Instructor {
  id: string;
  name: string;
  slug: string;
  photo: string;
  designation: string;
  expertise: string[];
  experience: string;
  certifications: string[];
  courses: string[];
  bio: string;
  linkedIn?: string;
  rating?: number;
  totalStudents?: number;
}

export interface BatchSchedule {
  id: string;
  day: string;
  time: string;
  mode: TrainingMode;
  seats: number;
  startDate: string;
  type: 'Weekday' | 'Weekend' | 'Fast-Track';
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  topics: string[];
}

export interface CourseReview {
  id: string;
  name: string;
  role: string;
  rating: number;
  date: string;
  review: string;
  photo?: string;
  verified: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  subCategory: string;
  level: CourseLevel;
  duration: string;
  totalHours: number;
  mode: TrainingMode;
  language: string;
  instructor: Instructor;
  syllabus: string[];
  modules: CourseModule[];
  prerequisites: string[];
  skills: string[];
  tools: string[];
  projects: string[];
  certification: string;
  careerOutcomes: string[];
  jobRoles: string[];
  placementSupport: boolean;
  batchSchedule: BatchSchedule[];
  onlineAvailable: boolean;
  classroomAvailable: boolean;
  oneToOneAvailable: boolean;
  price: number;
  discountPrice: number;
  currency: Currency;
  discountPercentage: number;
  thumbnail: string;
  banner: string;
  video?: string;
  rating: number;
  reviewCount: number;
  learnerCount: number;
  featured: boolean;
  trending: boolean;
  popular: boolean;
  status: CourseStatus;
  faqs: FAQ[];
  relatedCourses: string[];
  whoShouldJoin: string[];
  learningObjectives: string[];
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
}

// ── Master Program ───────────────────────────────────────────
export interface MasterProgramModule {
  id: string;
  title: string;
  duration: string;
  topics: string[];
  tools: string[];
}

export interface MasterProgram {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  duration: string;
  totalHours: number;
  modules: MasterProgramModule[];
  skills: string[];
  tools: string[];
  projects: number;
  certification: string;
  careerOutcomes: string[];
  jobRoles: string[];
  targetAudience: string[];
  prerequisites: string[];
  level: CourseLevel;
  price: number;
  discountPrice: number;
  currency: Currency;
  thumbnail: string;
  banner: string;
  featured: boolean;
  learnerCount: number;
  rating: number;
  reviewCount: number;
  placementSupport: boolean;
  faqs: FAQ[];
  status: CourseStatus;
}

// ── Category ─────────────────────────────────────────────────
export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  courseCount: number;
  courses: string[];
  featured: boolean;
  order: number;
}

// ── Testimonial ──────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  course: string;
  location: string;
  country: string;
  rating: number;
  review: string;
  photo?: string;
  date: string;
  featured: boolean;
  type: 'text' | 'video';
  videoUrl?: string;
  source?: string;
}

// ── Location ─────────────────────────────────────────────────
export interface Location {
  id: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  mapUrl?: string;
  courses: string[];
  facilities: string[];
  image: string;
  active: boolean;
  lat?: number;
  lng?: number;
}

// ── Blog ─────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    photo: string;
    role: string;
  };
  category: string;
  tags: string[];
  featuredImage: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// ── Internship ───────────────────────────────────────────────
export interface Internship {
  id: string;
  slug: string;
  title: string;
  company: string;
  duration: string;
  location: string;
  mode: TrainingMode;
  eligibility: string[];
  skills: string[];
  responsibilities: string[];
  certificate: boolean;
  stipend: string;
  applicationDeadline: string;
  status: 'open' | 'closed' | 'coming-soon';
  category: string;
  thumbnail: string;
}

// ── FAQ ──────────────────────────────────────────────────────
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// ── Stat ─────────────────────────────────────────────────────
export interface Stat {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  suffix: string;
  icon: string;
  description?: string;
}

// ── User / Auth ──────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'TRAINER' | 'COUNSELOR' | 'STUDENT' | 'CORPORATE_USER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  photo?: string;
  country: string;
  city: string;
  education?: string;
  experience?: string;
  createdAt: string;
  isActive: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string | null;
  permissions?: string[];
  enrolledCourses: string[];
}

// ── Enquiry ──────────────────────────────────────────────────
export interface EnquiryForm {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  course?: string;
  mode?: string;
  message?: string;
  consent: boolean;
}

export interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface CorporateEnquiryForm {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  teamSize: string;
  technologies: string[];
  trainingMode: string;
  timeline: string;
  message: string;
}

// ── Navigation ───────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  featured?: boolean;
  badge?: string;
}

export interface MegaMenuCategory {
  title: string;
  href: string;
  courses: Array<{
    title: string;
    href: string;
    badge?: string;
  }>;
}

// ── Payment ──────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentProvider = 'razorpay' | 'stripe' | 'paypal';

export interface PaymentOrder {
  id: string;
  courseId: string;
  userId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  provider: PaymentProvider;
  createdAt: string;
}

// ── Certificate ──────────────────────────────────────────────
export interface Certificate {
  id: string;
  type: 'completion' | 'project' | 'internship' | 'skill';
  title: string;
  description: string;
  features: string[];
  image: string;
}
