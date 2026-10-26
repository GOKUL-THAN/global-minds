import { useEffect, useMemo, useState } from 'react';
import type { CmsSection } from '../data/cmsSeeds';
import { cmsService, type PublicCmsRecord } from '../services/cmsService';
import { courseService } from '../services/courseService';
import type { Course } from '../types';

export function useCmsCollection<T extends object>(
  section: CmsSection,
  _staticRecords: readonly T[],
): T[] {
  const [published, setPublished] = useState<PublicCmsRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    if (section === 'courses') {
      void courseService.getAllCourses()
        .then(result => {
          if (!active) return;
          setCourses(result);
          setLoaded(true);
        })
        .catch(error => {
          console.error('[courses] Unable to load published courses:', error);
          if (active) {
            setCourses([]);
            setLoaded(true);
          }
        });
    } else {
      void cmsService.getPublic(section)
        .then(result => {
          if (!active) return;
          setPublished(result);
          setLoaded(true);
        })
        .catch(error => {
          console.error(`[cms] Unable to load published ${section}:`, error);
          if (active) {
            setPublished([]);
            setLoaded(true);
          }
        });
    }
    return () => { active = false; };
  }, [section]);

  return useMemo(() => {
    if (!loaded) return _staticRecords as T[];
    if (section === 'courses') {
      return courses as T[];
    }
    return published.flatMap(record => {
      if (record.status !== 'published') return [];
      const content = record.content as Record<string, unknown>;
      if (content.visible === false || content.isVisible === false
        || content.hidden === true || content.isHidden === true) return [];
      return [{
        ...content,
        id: typeof content.id === 'string' && content.id ? content.id : record.slug,
        slug: record.slug,
      } as T];
    });
  }, [loaded, published, section, courses, _staticRecords]);
}
