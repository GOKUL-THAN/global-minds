export type OperationalModule = 'students' | 'attendance' | 'batches' | 'internships' | 'activity' | 'certificates';

export interface OperationalStatus {
  modules: Record<OperationalModule, boolean>;
}

export interface OperationalSummary {
  students: number;
  activeBatches: number;
  todayAttendance: number;
  openInternships: number;
  activeCertificates: number;
}

export interface SystemHealth {
  api: string;
  database: string;
  databaseDriver: string;
  migrationsApplied: number;
  operationalModules: Record<OperationalModule, boolean>;
}

export interface OperationalPage<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('The admin API is unavailable. Check the server and try again.');
  }

  const result = response.status === 204 ? undefined : await response.json().catch(() => undefined) as {
    message?: string;
    error?: { message?: string };
    data?: T;
  } | undefined;
  if (!response.ok) {
    if (response.status === 401) throw new Error('Your admin session expired. Sign in again.');
    if (response.status === 403) throw new Error(result?.error?.message ?? 'You do not have permission to perform this action.');
    throw new Error(result?.error?.message ?? result?.message ?? `The admin API request failed (${response.status}).`);
  }
  return (result && 'data' in result ? result.data : result) as T;
}

export const adminOperationsService = {
  getStatus: () => request<OperationalStatus>('/api/admin/operations/status'),
  getSummary: () => request<OperationalSummary>('/api/admin/operations/summary'),
  getSystemHealth: () => request<SystemHealth>('/api/admin/system/health'),
  listPayments<T>(params: URLSearchParams) {
    return request<{ payments: T[]; total: number; page: number; pageSize: number }>(
      `/api/admin/payments?${params.toString()}`,
    );
  },
  recordManualPayment<T>(payment: {
    studentId: string;
    courseSlug?: string;
    amountMinor: number;
    currency: string;
    status?: 'pending' | 'succeeded';
    providerOrderId?: string;
  }) {
    return request<T>('/api/admin/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },
  getAttendanceReport: (params: URLSearchParams) =>
    request<{ report: Array<Record<string, unknown>>; total: number }>(`/api/admin/attendance/report?${params.toString()}`),
  listUsers<T>(role: 'TRAINER' | 'STUDENT') {
    return request<{ users: T[]; total: number }>(`/api/admin/users?role=${role}&page=1&pageSize=100`);
  },
  updateAccount<T>(id: string, changes: { isActive?: boolean; role?: string }) {
    return request<T>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  },
  async list<T>(module: OperationalModule, params: URLSearchParams): Promise<OperationalPage<T>> {
    const result = await request<unknown>(`/api/admin/${module}?${params.toString()}`);
    if (Array.isArray(result)) return { records: result as T[], total: result.length, page: Number(params.get('page') ?? 1), pageSize: Number(params.get('pageSize') ?? 25) };
    if (!result || typeof result !== 'object') throw new Error(`The ${module} API returned an invalid list response.`);
    const data = result as Record<string, unknown>;
    const collectionKeys: Record<OperationalModule, string[]> = {
      students: ['students'],
      attendance: ['attendance', 'records'],
      batches: ['batches'],
      internships: ['internships'],
      activity: ['entries', 'auditLogs', 'records'],
      certificates: ['certificates'],
    };
    const key = collectionKeys[module].find(candidate => Array.isArray(data[candidate]));
    const records = key ? data[key] as T[] : Array.isArray(data.records) ? data.records as T[] : undefined;
    if (!records) throw new Error(`The ${module} API returned no record collection.`);
    return {
      records,
      total: typeof data.total === 'number' ? data.total : records.length,
      page: typeof data.page === 'number' ? data.page : Number(params.get('page') ?? 1),
      pageSize: typeof data.pageSize === 'number' ? data.pageSize : Number(params.get('pageSize') ?? 25),
    };
  },
  create<T>(module: OperationalModule, payload: Record<string, unknown>) {
    if (module === 'attendance') {
      return request<T>('/api/admin/attendance', { method: 'PUT', body: JSON.stringify(payload) });
    }
    return request<T>(`/api/admin/${module}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  update<T>(module: OperationalModule, id: string, payload: Record<string, unknown>) {
    return request<T>(`/api/admin/${module}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  action<T>(module: OperationalModule, id: string, action: string, method: 'POST' | 'DELETE' = 'POST') {
    return request<T>(`/api/admin/${module}/${encodeURIComponent(id)}/${action}`, { method });
  },
  createInternshipApplication<T>(internshipId: string, payload: Record<string, unknown>) {
    return request<T>(`/api/admin/internships/${encodeURIComponent(internshipId)}/applications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  listInternshipApplications<T>(params: URLSearchParams) {
    return request<{ applications: T[]; total: number }>(`/api/admin/internships/applications?${params.toString()}`);
  },
  listStudentEnrollments<T>(studentId: string) {
    return request<{ enrollments: T[] }>(`/api/admin/students/${encodeURIComponent(studentId)}/enrollments`);
  },
  enrollStudent(studentId: string, courseSlug: string) {
    return request<{ id: string; status: string }>(`/api/admin/students/${encodeURIComponent(studentId)}/enrollments`, {
      method: 'POST',
      body: JSON.stringify({ courseSlug }),
    });
  },
  updateEnrollment(id: string, status: string) {
    return request<{ id: string; status: string }>(`/api/admin/enrollments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  updateInternshipApplication<T>(id: string, payload: Record<string, unknown>) {
    return request<T>(`/api/admin/internships/applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  assignBatch<T>(batchId: string, kind: 'students' | 'trainers', ids: string[]) {
    const key = kind === 'students' ? 'studentIds' : 'trainerIds';
    return request<T>(`/api/admin/batches/${encodeURIComponent(batchId)}/${kind}`, {
      method: 'PUT',
      body: JSON.stringify({ [key]: ids }),
    });
  },
  remove(module: OperationalModule, id: string) {
    return request<void>(`/api/admin/${module}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
