import { useCallback, useEffect, useRef, useState } from 'react';
import { courseService } from '../services/courseService';
import type { Course } from '../types';

export function useCourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const requestInFlight = useRef(false);
  const refreshQueued = useRef(false);
  const refresh = useCallback(() => {
    if (requestInFlight.current) {
      refreshQueued.current = true;
      return;
    }
    setReloadKey(key => key + 1);
  }, []);

  useEffect(() => {
    let active = true;
    requestInFlight.current = true;
    setLoading(true);
    setError('');
    void courseService.getAllCourses()
      .then(result => {
        if (active) setCourses(result);
      })
      .catch(cause => {
        if (!active) return;
        setCourses([]);
        setError(cause instanceof Error ? cause.message : 'Unable to load courses from the server.');
      })
      .finally(() => {
        if (!active) return;
        requestInFlight.current = false;
        setLoading(false);
        if (refreshQueued.current) {
          refreshQueued.current = false;
          setReloadKey(key => key + 1);
        }
      });
    return () => {
      active = false;
      requestInFlight.current = false;
    };
  }, [reloadKey]);

  useEffect(() => {
      const refreshWhenVisible = () => {
        if (document.visibilityState === 'visible') refresh();
      };
      window.addEventListener('focus', refreshWhenVisible);
      document.addEventListener('visibilitychange', refreshWhenVisible);
      return () => {
        window.removeEventListener('focus', refreshWhenVisible);
        document.removeEventListener('visibilitychange', refreshWhenVisible);
      };
  }, [refresh]);

  return { courses, loading, error, refresh };
}
