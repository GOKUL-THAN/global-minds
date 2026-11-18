import { useEffect, useState } from 'react';
import { cmsService } from '../services/cmsService';

export interface PublicBatch {
  id: string;
  name?: string;
  courseName?: string;
  schedule: {
    mode?: unknown;
    time?: unknown;
    days?: unknown;
    seatsLeft?: unknown;
  };
  seatsLeft?: number;
  startDate?: string;
  [key: string]: unknown;
}

export function usePublicBatches(): PublicBatch[] {
  const [batches, setBatches] = useState<PublicBatch[]>([]);

  useEffect(() => {
    let active = true;
    void cmsService.getPublic('batches')
      .then(records => {
        if (!active) return;
        setBatches(records
          .filter(record => record.status === 'published')
          .map(record => {
            const content = record.content as Record<string, unknown>;
            const schedule = content.schedule && typeof content.schedule === 'object'
              ? content.schedule as PublicBatch['schedule']
              : {};
            return {
              id: record.slug,
              ...content,
              schedule,
            };
          }));
      })
      .catch(() => {
        if (active) setBatches([]);
      });
    return () => { active = false; };
  }, []);

  return batches;
}
