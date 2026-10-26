import type { CmsSection } from '../data/cmsSeeds';

export type CmsStatus = 'draft' | 'published' | 'archived';

export interface CmsRecord<T = Record<string, unknown>> {
  id: string;
  section: CmsSection;
  slug: string;
  content: T;
  publishedContent: T | null;
  status: CmsStatus;
  hasDraft: boolean;
  archivedFromStatus: 'draft' | 'published' | null;
  createdBy: string;
  createdRole: 'ADMIN' | 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'TRAINER';
  updatedBy: string;
  updatedRole: 'ADMIN' | 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'TRAINER';
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  archivedAt: string | null;
  draftUpdatedAt: string | null;
}

export type PublicCmsRecord<T = Record<string, unknown>> =
  | { id: string; section: CmsSection; slug: string; status: 'published'; content: T; updatedAt: string; publishedAt: string | null }
  | { id: string; section: CmsSection; slug: string; status: 'archived' | 'unpublished'; updatedAt: string; publishedAt: string | null };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(result.message ?? `CMS request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// Public CMS reads — silently return empty when backend is unreachable
async function requestPublic<T>(path: string, emptyValue: T): Promise<T> {
  try {
    const response = await fetch(path, { credentials: 'same-origin' });
    // 404 = section not found, 401/403 = auth required — all mean "no CMS data, use static"
    if (!response.ok) return emptyValue;
    return await response.json() as T;
  } catch {
    // Network error = no backend running — fall through to static data
    return emptyValue;
  }
}

const adminPath = (section: CmsSection, slug?: string) =>
  `/api/admin/content/${encodeURIComponent(section)}${slug ? `/${encodeURIComponent(slug)}` : ''}`;

export const cmsService = {
  async listAdmin(section: CmsSection): Promise<CmsRecord[]> {
    const result = await request<{ records: CmsRecord[] }>(adminPath(section));
    return result.records;
  },
  async getPublic(section: CmsSection): Promise<PublicCmsRecord[]> {
    const result = await requestPublic<{ records: PublicCmsRecord[] }>(
      `/api/content/${encodeURIComponent(section)}`,
      { records: [] },
    );
    return result.records ?? [];
  },
  async create(section: CmsSection, slug: string, content: Record<string, unknown>): Promise<CmsRecord> {
    const result = await request<{ record: CmsRecord }>(adminPath(section), {
      method: 'POST',
      body: JSON.stringify({ slug, content }),
    });
    return result.record;
  },
  async update(section: CmsSection, slug: string, content: Record<string, unknown>): Promise<CmsRecord> {
    const result = await request<{ record: CmsRecord }>(adminPath(section, slug), {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return result.record;
  },
  async publish(section: CmsSection, slug: string): Promise<CmsRecord> {
    const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/publish`, { method: 'POST' });
    return result.record;
  },
  async unpublish(section: CmsSection, slug: string): Promise<CmsRecord> {
    const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/unpublish`, { method: 'POST' });
    return result.record;
  },
  async archive(section: CmsSection, slug: string): Promise<CmsRecord> {
    const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/archive`, { method: 'POST' });
    return result.record;
  },
  async restore(section: CmsSection, slug: string): Promise<CmsRecord> {
    const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/restore`, { method: 'POST' });
    return result.record;
  },
  async remove(section: CmsSection, slug: string): Promise<void> {
    await request<void>(adminPath(section, slug), { method: 'DELETE' });
  },
};
