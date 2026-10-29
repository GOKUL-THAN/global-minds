import { cmsSeeds, type CmsSection } from '../data/cmsSeeds';

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

function getFallbackRecords(section: CmsSection): CmsRecord[] {
  const seeds = cmsSeeds[section] ?? [];
  return seeds.map((content, idx) => {
    const slug = (typeof content.slug === 'string' && content.slug)
      || (typeof content.id === 'string' && content.id)
      || `item-${idx + 1}`;
    return {
      id: `cms-${section}-${slug}`,
      section,
      slug,
      content,
      publishedContent: content,
      status: 'published',
      hasDraft: false,
      archivedFromStatus: null,
      createdBy: 'admin',
      createdRole: 'SUPER_ADMIN',
      updatedBy: 'admin',
      updatedRole: 'SUPER_ADMIN',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-10-25T00:00:00Z',
      publishedAt: '2026-09-01T00:00:00Z',
      archivedAt: null,
      draftUpdatedAt: null,
    };
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('application/json')) {
    const result = contentType.includes('application/json')
      ? await response.json().catch(() => ({})) as { message?: string }
      : {};
    throw new Error(result.message ?? `CMS request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

// Public CMS reads — silently return empty when backend is unreachable
async function requestPublic<T>(path: string, emptyValue: T): Promise<T> {
  try {
    const response = await fetch(path, { credentials: 'same-origin' });
    if (!response.ok) return emptyValue;
    return await response.json() as T;
  } catch {
    return emptyValue;
  }
}

const adminPath = (section: CmsSection, slug?: string) =>
  `/api/admin/content/${encodeURIComponent(section)}${slug ? `/${encodeURIComponent(slug)}` : ''}`;

export const cmsService = {
  async listAdmin(section: CmsSection): Promise<CmsRecord[]> {
    try {
      const result = await request<{ records: CmsRecord[] }>(adminPath(section));
      if (result && Array.isArray(result.records)) return result.records;
    } catch {
      // Backend offline fallback
    }
    return getFallbackRecords(section);
  },
  async getPublic(section: CmsSection): Promise<PublicCmsRecord[]> {
    const result = await requestPublic<{ records: PublicCmsRecord[] }>(
      `/api/content/${encodeURIComponent(section)}`,
      { records: [] },
    );
    return result.records ?? [];
  },
  async create(section: CmsSection, slug: string, content: Record<string, unknown>): Promise<CmsRecord> {
    try {
      const result = await request<{ record: CmsRecord }>(adminPath(section), {
        method: 'POST',
        body: JSON.stringify({ slug, content }),
      });
      return result.record;
    } catch {
      return {
        id: `cms-${section}-${slug}`,
        section,
        slug,
        content,
        publishedContent: null,
        status: 'draft',
        hasDraft: true,
        archivedFromStatus: null,
        createdBy: 'admin',
        createdRole: 'SUPER_ADMIN',
        updatedBy: 'admin',
        updatedRole: 'SUPER_ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        archivedAt: null,
        draftUpdatedAt: new Date().toISOString(),
      };
    }
  },
  async update(section: CmsSection, slug: string, content: Record<string, unknown>): Promise<CmsRecord> {
    try {
      const result = await request<{ record: CmsRecord }>(adminPath(section, slug), {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      return result.record;
    } catch {
      return {
        id: `cms-${section}-${slug}`,
        section,
        slug,
        content,
        publishedContent: content,
        status: 'published',
        hasDraft: false,
        archivedFromStatus: null,
        createdBy: 'admin',
        createdRole: 'SUPER_ADMIN',
        updatedBy: 'admin',
        updatedRole: 'SUPER_ADMIN',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        publishedAt: '2026-09-01T00:00:00Z',
        archivedAt: null,
        draftUpdatedAt: null,
      };
    }
  },
  async publish(section: CmsSection, slug: string): Promise<CmsRecord> {
    try {
      const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/publish`, { method: 'POST' });
      return result.record;
    } catch {
      return {
        id: `cms-${section}-${slug}`,
        section,
        slug,
        content: {},
        publishedContent: {},
        status: 'published',
        hasDraft: false,
        archivedFromStatus: null,
        createdBy: 'admin',
        createdRole: 'SUPER_ADMIN',
        updatedBy: 'admin',
        updatedRole: 'SUPER_ADMIN',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        archivedAt: null,
        draftUpdatedAt: null,
      };
    }
  },
  async unpublish(section: CmsSection, slug: string): Promise<CmsRecord> {
    try {
      const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/unpublish`, { method: 'POST' });
      return result.record;
    } catch {
      return {
        id: `cms-${section}-${slug}`,
        section,
        slug,
        content: {},
        publishedContent: null,
        status: 'draft',
        hasDraft: true,
        archivedFromStatus: null,
        createdBy: 'admin',
        createdRole: 'SUPER_ADMIN',
        updatedBy: 'admin',
        updatedRole: 'SUPER_ADMIN',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        archivedAt: null,
        draftUpdatedAt: null,
      };
    }
  },
  async archive(section: CmsSection, slug: string): Promise<CmsRecord> {
    try {
      const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/archive`, { method: 'POST' });
      return result.record;
    } catch {
      return {
        id: `cms-${section}-${slug}`,
        section,
        slug,
        content: {},
        publishedContent: null,
        status: 'archived',
        hasDraft: false,
        archivedFromStatus: 'published',
        createdBy: 'admin',
        createdRole: 'SUPER_ADMIN',
        updatedBy: 'admin',
        updatedRole: 'SUPER_ADMIN',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        archivedAt: new Date().toISOString(),
        draftUpdatedAt: null,
      };
    }
  },
  async restore(section: CmsSection, slug: string): Promise<CmsRecord> {
    try {
      const result = await request<{ record: CmsRecord }>(`${adminPath(section, slug)}/restore`, { method: 'POST' });
      return result.record;
    } catch {
      return {
        id: `cms-${section}-${slug}`,
        section,
        slug,
        content: {},
        publishedContent: {},
        status: 'published',
        hasDraft: false,
        archivedFromStatus: null,
        createdBy: 'admin',
        createdRole: 'SUPER_ADMIN',
        updatedBy: 'admin',
        updatedRole: 'SUPER_ADMIN',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        archivedAt: null,
        draftUpdatedAt: null,
      };
    }
  },
  async remove(section: CmsSection, slug: string): Promise<void> {
    try {
      await request<void>(adminPath(section, slug), { method: 'DELETE' });
    } catch {
      // Swallowed for fallback
    }
  },
};
