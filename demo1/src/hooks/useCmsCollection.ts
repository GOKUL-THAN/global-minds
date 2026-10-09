import { useEffect, useMemo, useState } from 'react';
import type { CmsSection } from '../data/cmsSeeds';
import { cmsService, type PublicCmsRecord } from '../services/cmsService';
import { courseService } from '../services/courseService';
import type { Course } from '../types';

function getSlug(record: unknown): string | undefined {
  if (!record || typeof record !== 'object') return undefined;
  const item = record as Record<string, unknown>;
  if (typeof item.slug === 'string') return item.slug;
  if (typeof item.id === 'string' && /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(item.id)) return item.id;
  return undefined;
}

export function useCmsCollection<T extends object>(
  section: CmsSection,
  staticRecords: readonly T[],
): T[] {
  const [published, setPublished] = useState<PublicCmsRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    let active = true;
    if (section === 'courses') {
      void courseService.getAllCourses()
        .then(result => { if (active) setCourses(result); })
        .catch(error => {
          console.error('[courses] Unable to load published courses:', error);
          if (active) setCourses([]);
        });
    } else {
      void cmsService.getPublic(section)
        .then(result => { if (active) setPublished(result); })
        .catch(error => {
          console.error(`[cms] Unable to load published ${section}:`, error);
          if (active) setPublished([]);
        });
    }
    return () => { active = false; };
  }, [section]);

  return useMemo(() => {
    if (section === 'courses') {
      return courses as T[];
    }
    const overlays = new Map(published.map(record => [record.slug, record]));
    const merged: T[] = [];
    const seen = new Set<string>();
    for (const source of staticRecords) {
      const slug = getSlug(source);
      if (!slug) {
        merged.push(source);
        continue;
      }
      seen.add(slug);
      const overlay = overlays.get(slug);
      if (overlay?.status === 'archived') continue;
      if (overlay?.status === 'published') merged.push({ ...source, ...overlay.content, slug: overlay.slug } as T);
      else merged.push(source);
    }
    for (const record of published) {
      if (record.status === 'published' && !seen.has(record.slug)) {
        merged.push({ ...record.content, slug: record.slug } as T);
      }
    }
    return merged;
  }, [published, section, staticRecords, courses]);
}
