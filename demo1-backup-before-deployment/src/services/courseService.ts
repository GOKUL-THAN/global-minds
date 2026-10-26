import { cmsService, type PublicCmsRecord } from './cmsService';
import { publicCourseCatalog } from '../data/publicCourseCatalog';
import type { Course } from '../types';

export interface CourseFilterOptions {
  category?: string;
  level?: string;
  mode?: string;
  priceMin?: number;
  priceMax?: number;
  online?: boolean;
  classroom?: boolean;
  certification?: boolean;
  masterProgram?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc';
}

function stringValue(record: Record<string, unknown>, key: string, fallback = ''): string {
  return typeof record[key] === 'string' ? record[key] as string : fallback;
}

function numberValue(record: Record<string, unknown>, key: string): number {
  return typeof record[key] === 'number' && Number.isFinite(record[key])
    ? record[key] as number
    : 0;
}

function listValue(record: Record<string, unknown>, key: string): unknown[] {
  return Array.isArray(record[key]) ? record[key] as unknown[] : [];
}

function booleanValue(record: Record<string, unknown>, key: string): boolean {
  return record[key] === true;
}

export function mapPublishedCourse(record: Extract<PublicCmsRecord, { status: 'published' }>): Course {
  const content = record.content as Record<string, unknown>;
  const rawInstructor = content.instructor && typeof content.instructor === 'object' && !Array.isArray(content.instructor)
    ? content.instructor as Record<string, unknown>
    : {};
  const instructor = {
    id: stringValue(rawInstructor, 'id'),
    name: stringValue(rawInstructor, 'name'),
    slug: stringValue(rawInstructor, 'slug'),
    photo: stringValue(rawInstructor, 'photo'),
    designation: stringValue(rawInstructor, 'designation'),
    expertise: listValue(rawInstructor, 'expertise') as string[],
    experience: stringValue(rawInstructor, 'experience'),
    certifications: listValue(rawInstructor, 'certifications') as string[],
    courses: listValue(rawInstructor, 'courses') as string[],
    bio: stringValue(rawInstructor, 'bio'),
    linkedIn: stringValue(rawInstructor, 'linkedIn') || undefined,
    rating: typeof rawInstructor.rating === 'number' ? rawInstructor.rating : undefined,
    totalStudents: typeof rawInstructor.totalStudents === 'number' ? rawInstructor.totalStudents : undefined,
  };

  return {
    ...content,
    id: stringValue(content, 'id', record.id),
    slug: record.slug,
    title: stringValue(content, 'title', record.slug),
    shortDescription: stringValue(content, 'shortDescription'),
    longDescription: stringValue(content, 'longDescription'),
    category: stringValue(content, 'category'),
    subCategory: stringValue(content, 'subCategory'),
    level: stringValue(content, 'level', 'All Levels') as Course['level'],
    duration: stringValue(content, 'duration'),
    totalHours: numberValue(content, 'totalHours'),
    mode: stringValue(content, 'mode', 'Online') as Course['mode'],
    language: stringValue(content, 'language'),
    instructor,
    syllabus: listValue(content, 'syllabus') as string[],
    modules: listValue(content, 'modules') as Course['modules'],
    prerequisites: listValue(content, 'prerequisites') as string[],
    skills: listValue(content, 'skills') as string[],
    tools: listValue(content, 'tools') as string[],
    projects: listValue(content, 'projects') as string[],
    certification: stringValue(content, 'certification'),
    careerOutcomes: listValue(content, 'careerOutcomes') as string[],
    jobRoles: listValue(content, 'jobRoles') as string[],
    placementSupport: booleanValue(content, 'placementSupport'),
    batchSchedule: listValue(content, 'batchSchedule') as Course['batchSchedule'],
    onlineAvailable: booleanValue(content, 'onlineAvailable'),
    classroomAvailable: booleanValue(content, 'classroomAvailable'),
    oneToOneAvailable: booleanValue(content, 'oneToOneAvailable'),
    price: numberValue(content, 'price'),
    discountPrice: numberValue(content, 'discountPrice'),
    currency: stringValue(content, 'currency', 'INR') as Course['currency'],
    discountPercentage: numberValue(content, 'discountPercentage'),
    thumbnail: stringValue(content, 'thumbnail'),
    banner: stringValue(content, 'banner'),
    video: stringValue(content, 'video') || undefined,
    rating: numberValue(content, 'rating'),
    reviewCount: numberValue(content, 'reviewCount'),
    learnerCount: numberValue(content, 'learnerCount'),
    featured: booleanValue(content, 'featured'),
    trending: booleanValue(content, 'trending'),
    popular: booleanValue(content, 'popular'),
    status: 'active',
    faqs: listValue(content, 'faqs') as Course['faqs'],
    relatedCourses: listValue(content, 'relatedCourses') as string[],
    whoShouldJoin: listValue(content, 'whoShouldJoin') as string[],
    learningObjectives: listValue(content, 'learningObjectives') as string[],
    tags: listValue(content, 'tags') as string[],
    metaTitle: stringValue(content, 'metaTitle') || undefined,
    metaDescription: stringValue(content, 'metaDescription') || undefined,
  };
}

class CourseService {
  async getAllCourses(): Promise<Course[]> {
    const records = await cmsService.getPublic('courses');
    const publishedRecords = new Map(records
      .filter((record): record is Extract<PublicCmsRecord, { status: 'published' }> => record.status === 'published')
      .map(record => [record.slug, record]));

    return publicCourseCatalog.flatMap(listing => {
      const record = publishedRecords.get(listing.sourceSlug);
      return record ? [mapPublishedCourse(record)] : [];
    });
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    return (await this.getAllCourses()).find(course => course.slug === slug);
  }

  async getCoursesByCategory(categorySlug: string): Promise<Course[]> {
    return (await this.getAllCourses()).filter(course => course.category === categorySlug);
  }

  async getFeaturedCourses(): Promise<Course[]> {
    return (await this.getAllCourses()).filter(course => course.featured);
  }

  async getTrendingCourses(): Promise<Course[]> {
    return (await this.getAllCourses()).filter(course => course.trending);
  }

  async searchCourses(query: string, filters?: CourseFilterOptions): Promise<Course[]> {
    const normalizedQuery = query.trim().toLowerCase();
    let results = (await this.getAllCourses()).filter(course =>
      !normalizedQuery
      || [
        course.title,
        course.shortDescription,
        course.longDescription,
        course.category,
        course.subCategory,
        ...course.tags,
        ...course.skills,
      ]
        .some(value => value.toLowerCase().includes(normalizedQuery)));
    if (filters) {
      if (filters.category) results = results.filter(course => course.category === filters.category);
      if (filters.level) results = results.filter(course => course.level === filters.level);
      if (filters.mode) results = results.filter(course => course.mode === filters.mode);
      if (filters.online !== undefined) results = results.filter(course => course.onlineAvailable === filters.online);
      if (filters.classroom !== undefined) results = results.filter(course => course.classroomAvailable === filters.classroom);
      if (filters.priceMin !== undefined) results = results.filter(course => course.discountPrice >= filters.priceMin!);
      if (filters.priceMax !== undefined) results = results.filter(course => course.discountPrice <= filters.priceMax!);
      switch (filters.sortBy) {
        case 'newest': results.sort((first, second) => second.slug.localeCompare(first.slug)); break;
        case 'price-asc': results.sort((first, second) => first.discountPrice - second.discountPrice); break;
        case 'price-desc': results.sort((first, second) => second.discountPrice - first.discountPrice); break;
      }
    }
    return results;
  }

  async getRelatedCourses(courseSlug: string): Promise<Course[]> {
    const allCourses = await this.getAllCourses();
    const source = allCourses.find(course => course.slug === courseSlug);
    if (!source) return [];
    return allCourses.filter(course => course.slug !== source.slug
      && (source.relatedCourses.includes(course.slug) || course.category === source.category));
  }
}

export const courseService = new CourseService();
