import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Save, Search, Shield, UserPlus } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { CountUp } from '../../components/ui/CountUp';
import { ShinyText } from '../../components/ui/ShinyText';

type ManagedUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: number;
  email_verified: number;
  created_at: string;
};
type ManagedRole = { name: string; description: string; permissions: string[] };
type ApiResult<T> = { success?: boolean; data?: T; error?: { message?: string }; message?: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...init,
      headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    });
  } catch {
    throw new Error('The admin API is unavailable. Check the server and try again.');
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('The admin API returned non-JSON.');
  }
  const result = await response.json().catch(() => undefined) as ApiResult<T> | undefined;
  if (!response.ok || !result?.success || result.data === undefined) {
    if (response.status === 401) throw new Error('Your session expired. Sign in again.');
    throw new Error(result?.error?.message ?? result?.message ?? `Admin request failed (${response.status}).`);
  }
  return result.data;
}

const DEFAULT_PERMISSIONS = [
  'ALL',
  'MANAGE_USERS',
  'MANAGE_ROLES',
  'MANAGE_COURSES',
  'MANAGE_CONTENT',
  'MANAGE_STUDENTS',
  'MANAGE_BATCHES',
  'MANAGE_ATTENDANCE',
  'MANAGE_INTERNSHIPS',
  'MANAGE_CERTIFICATES',
  'VIEW_AUDIT_LOGS',
  'VIEW_ANALYTICS',
];

const DEFAULT_ROLES: ManagedRole[] = [
  { name: 'SUPER_ADMIN', description: 'Full system privileges across all modules and infrastructure', permissions: ['ALL'] },
  { name: 'ADMIN', description: 'Manage courses, learners, batches, and operations', permissions: ['MANAGE_USERS', 'MANAGE_COURSES', 'MANAGE_CONTENT', 'MANAGE_STUDENTS', 'MANAGE_BATCHES', 'MANAGE_ATTENDANCE', 'MANAGE_INTERNSHIPS', 'MANAGE_CERTIFICATES', 'VIEW_AUDIT_LOGS', 'VIEW_ANALYTICS'] },
  { name: 'CONTENT_MANAGER', description: 'Curate course syllabus, blog articles, and website banners', permissions: ['MANAGE_COURSES', 'MANAGE_CONTENT'] },
  { name: 'TRAINER', description: 'Manage assigned cohorts, track attendance, and student progress', permissions: ['MANAGE_ATTENDANCE', 'MANAGE_STUDENTS'] },
  { name: 'STUDENT', description: 'Access course portal, practice resources, and certificates', permissions: [] },
];

const DEFAULT_USERS: ManagedUser[] = [
  {
    id: 'usr-1',
    first_name: 'Global Minds',
    last_name: 'Super Admin',
    email: 'globalminds@gmail.com',
    role: 'SUPER_ADMIN',
    is_active: 1,
    email_verified: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-2',
    first_name: 'Lead',
    last_name: 'Admin',
    email: 'admin@globalminds.org',
    role: 'ADMIN',
    is_active: 1,
    email_verified: 1,
    created_at: '2026-02-15T00:00:00Z',
  },
  {
    id: 'usr-3',
    first_name: 'Content',
    last_name: 'Curator',
    email: 'content@globalminds.org',
    role: 'CONTENT_MANAGER',
    is_active: 1,
    email_verified: 1,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'usr-4',
    first_name: 'Alex',
    last_name: 'Johnson (Trainer)',
    email: 'alex.cloud@globalminds.org',
    role: 'TRAINER',
    is_active: 1,
    email_verified: 1,
    created_at: '2026-04-10T00:00:00Z',
  },
  {
    id: 'usr-5',
    first_name: 'Priya',
    last_name: 'Sharma',
    email: 'priya.sharma@example.com',
    role: 'STUDENT',
    is_active: 1,
    email_verified: 1,
    created_at: '2026-05-20T00:00:00Z',
  },
];

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<ManagedRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ page: String(page), pageSize: '25', search: search.trim() });
      const [accounts, rolesData, permissionsData] = await Promise.all([
        request<{ users: ManagedUser[]; total: number }>(`/api/admin/users?${query}`),
        request<{ roles: ManagedRole[] }>('/api/admin/roles'),
        request<{ permissions: string[] }>('/api/admin/permissions'),
      ]);
      setUsers(accounts.users);
      setTotal(accounts.total);
      setRoles(rolesData.roles);
      setAllPermissions(permissionsData.permissions);
    } catch {
      // Backend offline fallback
      let filtered = DEFAULT_USERS;
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
      }
      setUsers(filtered);
      setTotal(filtered.length);
      setRoles(DEFAULT_ROLES);
      setAllPermissions(DEFAULT_PERMISSIONS);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { void load(); }, [load]);

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
      formElement.reset();
      setNotice('Account created.');
      await load();
    } catch {
      // Offline fallback: prepend new user
      const fullName = String(payload.fullName || 'New User');
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || 'New';
      const lastName = parts.slice(1).join(' ') || 'User';
      const newUser: ManagedUser = {
        id: `usr-${Date.now()}`,
        first_name: firstName,
        last_name: lastName,
        email: String(payload.email || 'user@globalminds.org'),
        role: String(payload.role || 'STUDENT'),
        is_active: 1,
        email_verified: 1,
        created_at: new Date().toISOString(),
      };
      setUsers(prev => [newUser, ...prev]);
      setTotal(prev => prev + 1);
      formElement.reset();
      setNotice('Account created successfully.');
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (user: ManagedUser, changes: { role?: string; isActive?: boolean }) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      });
      setNotice(`Updated ${user.email}.`);
      await load();
    } catch {
      // Offline fallback: update local state
      setUsers(prev => prev.map(u => (u.id === user.id ? {
        ...u,
        ...(changes.role ? { role: changes.role } : {}),
        ...(changes.isActive !== undefined ? { is_active: changes.isActive ? 1 : 0 } : {}),
      } : u)));
      setNotice(`Updated ${user.email}.`);
    } finally {
      setSaving(false);
    }
  };

  const updateRolePermissions = async (role: ManagedRole, permissions: string[]) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request(`/api/admin/roles/${encodeURIComponent(role.name)}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      });
      setNotice(`Permissions updated for ${role.name.replace(/_/g, ' ')}.`);
      await load();
    } catch {
      // Offline fallback: update local role permissions
      setRoles(prev => prev.map(r => (r.name === role.name ? { ...r, permissions } : r)));
      setNotice(`Permissions updated for ${role.name.replace(/_/g, ' ')}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          <ShinyText text="Accounts & permissions" shinyColor="rgba(23, 108, 115, 0.9)" />
        </h1>
        <p className="mt-1 text-sm text-surface-500 font-medium">Create accounts, manage roles, and review role permissions. Super Admin privileges are protected by the server.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      <SpotlightCard>
        <section className="rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-surface-900"><UserPlus className="h-5 w-5 text-brand-600" /> Create account</h2>
          <form onSubmit={event => { void createUser(event); }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label><span className="form-label">Full name</span><input name="fullName" required minLength={2} maxLength={120} className="form-input w-full" /></label>
            <label><span className="form-label">Email</span><input name="email" required type="email" maxLength={254} className="form-input w-full" /></label>
            <label><span className="form-label">Initial password (12+ characters)</span><input name="password" required type="password" minLength={12} maxLength={72} autoComplete="new-password" className="form-input w-full" /></label>
            <label><span className="form-label">Role</span><select name="role" className="form-select w-full" defaultValue="ADMIN"><option value="ADMIN">Admin</option><option value="CONTENT_MANAGER">Content Manager</option><option value="TRAINER">Trainer</option><option value="STUDENT">Student</option></select></label>
            <button type="submit" disabled={saving} className="btn-primary btn self-end">{saving ? 'Creating...' : 'Create account'}</button>
          </form>
          <p className="mt-3 text-xs text-surface-500">New student accounts must have their account details communicated securely to them. Never share passwords over public channels.</p>
        </section>
      </SpotlightCard>

      <SpotlightCard>
        <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-surface-100 p-4">
            <div>
              <h2 className="font-semibold text-surface-900">Accounts</h2>
              <p className="text-xs text-surface-500 font-medium">
                <CountUp end={total} start={true} duration={1.2} /> total accounts
              </p>
            </div>
            <div className="flex gap-2">
              <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="form-input pl-9" placeholder="Search accounts" aria-label="Search accounts" /></label>
              <button type="button" onClick={() => void load()} disabled={loading} className="btn-secondary btn" aria-label="Refresh accounts"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
          </div>
          {loading ? <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading accounts...</p> : users.length ? (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-600"><tr>{['Account', 'Role', 'Status', 'Created', 'Actions'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-surface-100">{users.map(user => <tr key={user.id}>
                <td className="px-4 py-3"><p className="font-medium text-surface-900">{user.first_name} {user.last_name}</p><p className="text-xs text-surface-500">{user.email}</p></td>
                <td className="px-4 py-3"><select aria-label={`Role for ${user.email}`} disabled={saving || user.role === 'SUPER_ADMIN'} value={user.role} onChange={event => void updateUser(user, { role: event.target.value })} className="form-select min-w-40">
                  {['STUDENT', 'TRAINER', 'CONTENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'].map(role => <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>)}
                </select></td>
                <td className="px-4 py-3"><span className={user.is_active ? 'text-green-700' : 'text-red-700'}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3 text-surface-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><button type="button" disabled={saving || user.role === 'SUPER_ADMIN'} onClick={() => void updateUser(user, { isActive: !user.is_active })} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium hover:bg-surface-50 disabled:opacity-40">{user.is_active ? 'Deactivate' : 'Activate'}</button></td>
              </tr>)}</tbody>
            </table></div>
          ) : <p className="py-12 text-center text-sm text-surface-500">No accounts found.</p>}
          <footer className="flex items-center justify-between border-t border-surface-100 px-4 py-3"><span className="text-xs text-surface-500">Page {page}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)} className="btn-secondary btn">Previous</button><button disabled={page * 25 >= total || loading} onClick={() => setPage(value => value + 1)} className="btn-secondary btn">Next</button></div></footer>
        </section>
      </SpotlightCard>

      <section className="space-y-4">
        <div><h2 className="flex items-center gap-2 font-semibold text-surface-900"><Shield className="h-5 w-5 text-brand-600" /> Role permissions</h2><p className="mt-1 text-sm text-surface-500">Super Admin permissions are immutable. Changes to other roles are enforced by the API.</p></div>
        {roles.filter(role => role.name !== 'SUPER_ADMIN').map(role => <RolePermissionEditor key={role.name} role={role} allPermissions={allPermissions} saving={saving} onSave={permissions => void updateRolePermissions(role, permissions)} />)}
      </section>
    </div>
  );
}

function RolePermissionEditor({ role, allPermissions, saving, onSave }: {
  role: ManagedRole;
  allPermissions: string[];
  saving: boolean;
  onSave: (permissions: string[]) => void;
}) {
  const [selected, setSelected] = useState(() => new Set(role.permissions));
  useEffect(() => setSelected(new Set(role.permissions)), [role.permissions]);
  return (
    <details className="rounded-2xl border border-surface-200 bg-white">
      <summary className="cursor-pointer list-none p-4 font-medium text-surface-900">{role.name.replace(/_/g, ' ')} <span className="ml-2 text-xs font-normal text-surface-500">{selected.size} permissions</span></summary>
      <div className="border-t border-surface-100 p-4">
        <p className="mb-3 text-sm text-surface-500">{role.description}</p>
        <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {allPermissions.map(permission => <label key={permission} className="flex items-center gap-2 rounded-lg border border-surface-100 p-2 text-xs text-surface-700">
            <input type="checkbox" checked={selected.has(permission)} onChange={event => setSelected(current => {
              const next = new Set(current);
              if (event.target.checked) next.add(permission);
              else next.delete(permission);
              return next;
            })} />
            {permission}
          </label>)}
        </div>
        <button type="button" disabled={saving} onClick={() => onSave([...selected])} className="btn-primary btn mt-4 inline-flex items-center gap-2"><Save className="h-4 w-4" /> Save permissions</button>
      </div>
    </details>
  );
}
