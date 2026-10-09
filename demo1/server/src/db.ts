import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { closeDataDatabase, getDataDatabase, initializeDataDatabase } from './database.js';
import { config } from './config.js';
import { runMigrations } from './migrations.js';

export interface AdminAccount {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  password_hash: string;
}

export interface StudentAccount {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  phone: string;
  country: string;
  city: string;
  education: string;
  experience: string;
  interested_course: string;
  mode: string;
  career_goal: string;
  created_at: string;
  is_active: number;
  email_verified: number;
}

export type IdentityRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'TRAINER' | 'STUDENT';
type CmsActor = { id: string; role: IdentityRole; ipAddress?: string };

export interface IdentityAccount {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: IdentityRole;
  is_active: number;
  email_verified: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  country: string;
  city: string;
  education: string;
  experience: string;
}

export interface AuthenticatedSession {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: IdentityRole;
  is_active: number;
  email_verified: number;
  created_at: string;
  last_login_at: string | null;
  country: string;
  city: string;
  education: string;
  experience: string;
  permissions: string[];
}

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  status: 'new' | 'contacted' | 'enrolled' | 'not-interested' | 'follow-up';
  source: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  followUpDate?: string;
}

export const cmsSections = [
  'dashboard',
  'courses',
  'categories',
  'master-programs',
  'website-menu',
  'live-projects',
  'events',
  'scholarships',
  'refer-earn',
  'corporate-training',
  'about',
  'contact',
  'online-training',
  'classroom-training',
  'certifications',
  'demo-class',
  'skill-assessment',
  'career',
  'placement-records',
  'interview-preparation',
  'mock-interview',
  'students',
  'instructors',
  'enquiries',
  'internships',
  'batches',
  'locations',
  'blog',
  'faqs',
  'testimonials',
  'certificates',
  'payments',
  'settings',
] as const;

export type CmsSection = typeof cmsSections[number];
export type CmsStatus = 'draft' | 'published' | 'archived';

export interface CmsRecord {
  id: string;
  section: CmsSection;
  slug: string;
  content: Record<string, unknown>;
  publishedContent: Record<string, unknown> | null;
  status: CmsStatus;
  hasDraft: boolean;
  archivedFromStatus: Exclude<CmsStatus, 'archived'> | null;
  createdBy: string;
  createdRole: IdentityRole;
  updatedBy: string;
  updatedRole: IdentityRole;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  archivedAt: string | null;
  draftUpdatedAt: string | null;
}

const identitySelect = `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name,
  u.phone, r.name AS role, u.is_active, u.email_verified, u.created_at, u.updated_at,
  u.last_login_at, COALESCE(sp.country, '') AS country, COALESCE(sp.city, '') AS city,
  COALESCE(sp.education, '') AS education, COALESCE(sp.experience, '') AS experience
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  LEFT JOIN student_profiles sp ON sp.user_id = u.id`;

async function queryOne<T>(sql: string, values: (string | number | null)[] = []): Promise<T | undefined> {
  const result = await getDataDatabase().query<T>(sql, values);
  return result.rows[0];
}

async function queryAll<T>(sql: string, values: (string | number | null)[] = []): Promise<T[]> {
  const result = await getDataDatabase().query<T>(sql, values);
  return result.rows;
}

function mutateAndSave<T>(mutation: () => Promise<T>): Promise<T> {
  return getDataDatabase().transaction(mutation);
}

export function findAdminByEmail(email: string): Promise<AdminAccount | undefined> {
  return queryOne<AdminAccount>(
    `SELECT id, email, password_hash, role FROM admin_users
     WHERE email = ? AND is_active = 1`,
    [email],
  );
}

export function findActiveAdminById(id: string): Promise<Omit<AdminAccount, 'password_hash'> | undefined> {
  return queryOne<Omit<AdminAccount, 'password_hash'>>(
    `SELECT id, email, role FROM admin_users WHERE id = ? AND is_active = 1`,
    [id],
  );
}

export function findStudentByEmail(email: string): Promise<StudentAccount | undefined> {
  return queryOne<StudentAccount>(
    `SELECT id, email, full_name, password_hash, phone, country, city, education,
       experience, interested_course, mode, career_goal, created_at, is_active, email_verified
     FROM student_users WHERE email = ?`,
    [email],
  );
}

export function findActiveStudentById(id: string): Promise<Omit<StudentAccount, 'password_hash'> | undefined> {
  return queryOne<Omit<StudentAccount, 'password_hash'>>(
    `SELECT id, email, full_name, phone, country, city, education, experience,
       interested_course, mode, career_goal, created_at, is_active, email_verified
     FROM student_users WHERE id = ? AND is_active = 1`,
    [id],
  );
}

export async function findIdentityByEmail(email: string): Promise<IdentityAccount | undefined> {
  return queryOne<IdentityAccount>(
    `${identitySelect} WHERE lower(u.email) = ?`,
    [email.trim().toLowerCase()],
  );
}

export async function findIdentityById(id: string): Promise<IdentityAccount | undefined> {
  return queryOne<IdentityAccount>(`${identitySelect} WHERE u.id = ?`, [id]);
}

export async function listIdentityPermissions(role: IdentityRole): Promise<string[]> {
  const rows = await queryAll<{ name: string }>(
    `SELECT p.name FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN roles r ON r.id = rp.role_id
     WHERE r.name = ? ORDER BY p.name`,
    [role],
  );
  return rows.map(permission => permission.name);
}

export async function listIdentityRoles(): Promise<Array<{
  name: IdentityRole;
  description: string;
  permissions: string[];
}>> {
  const roles = await queryAll<{ name: IdentityRole; description: string }>(
    'SELECT name, description FROM roles ORDER BY name',
  );
  return Promise.all(roles.map(async role => ({
    ...role,
    permissions: await listIdentityPermissions(role.name),
  })));
}

export async function listIdentityPermissionNames(): Promise<string[]> {
  const rows = await queryAll<{ name: string }>('SELECT name FROM permissions ORDER BY name');
  return rows.map(permission => permission.name);
}

export async function replaceIdentityRolePermissions(
  role: IdentityRole,
  permissions: string[],
  actorId: string,
  ipAddress: string,
): Promise<boolean> {
  if (role === 'SUPER_ADMIN') return false;
  return mutateAndSave(async () => {
    const roleRow = await queryOne<{ id: string }>('SELECT id FROM roles WHERE name = ?', [role]);
    if (!roleRow) return false;
    const available = permissions.length
      ? await queryAll<{ id: string; name: string }>(
        `SELECT id, name FROM permissions WHERE name IN (${permissions.map(() => '?').join(', ')})`,
        permissions,
      )
      : [];
    if (available.length !== permissions.length) return false;
    await getDataDatabase().execute('DELETE FROM role_permissions WHERE role_id = ?', [roleRow.id]);
    for (const permission of available) {
      await getDataDatabase().execute(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [roleRow.id, permission.id],
      );
    }
    await getDataDatabase().execute(
      'UPDATE roles SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), roleRow.id],
    );
    await insertAuditLog(actorId, 'rbac.role.permissions_updated', 'role', role, {
      permissionCount: permissions.length,
    }, ipAddress);
    return true;
  });
}

export async function listAuditLogs(input: {
  page: number;
  pageSize: number;
}): Promise<{ entries: Array<{
  id: string;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata_json: string;
  ip_address: string;
  created_at: string;
}>; total: number }> {
  const count = await queryOne<{ total: number }>('SELECT COUNT(*) AS total FROM audit_logs');
  const entries = await queryAll<{
    id: string;
    actor_user_id: string | null;
    action: string;
    resource_type: string;
    resource_id: string | null;
    metadata_json: string;
    ip_address: string;
    created_at: string;
  }>(
    `SELECT id, actor_user_id, action, resource_type, resource_id, metadata_json,
      ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [input.pageSize, (input.page - 1) * input.pageSize],
  );
  return { entries, total: Number(count?.total ?? 0) };
}

export async function createIdentitySession(input: {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: string;
}): Promise<void> {
  await mutateAndSave(async () => {
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      `INSERT INTO sessions
       (id, user_id, token_hash, user_agent, ip_address, created_at, last_seen_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id, input.userId, input.tokenHash, input.userAgent.slice(0, 500),
        input.ipAddress.slice(0, 64), now, now, input.expiresAt,
      ],
    );
    await insertAuditLog(input.userId, 'auth.session.created', 'session', input.id, {}, input.ipAddress);
  });
}

export async function getAuthenticatedSession(
  sessionId: string,
  tokenHash: string,
): Promise<AuthenticatedSession | undefined> {
  const now = new Date().toISOString();
  const account = await queryOne<Omit<AuthenticatedSession, 'permissions'>>(
    `SELECT s.id, s.user_id, u.email, u.first_name, u.last_name, u.phone,
      r.name AS role, u.is_active, u.email_verified, u.created_at, u.last_login_at,
      COALESCE(sp.country, '') AS country, COALESCE(sp.city, '') AS city,
      COALESCE(sp.education, '') AS education, COALESCE(sp.experience, '') AS experience
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     WHERE s.id = ? AND s.token_hash = ? AND s.revoked_at IS NULL
       AND s.expires_at > ? AND u.is_active = 1
       AND (r.name != 'STUDENT' OR u.email_verified = 1)`,
    [sessionId, tokenHash, now],
  );
  if (!account) return undefined;
  const permissions = await listIdentityPermissions(account.role);
  return { ...account, permissions };
}

export async function touchIdentitySession(sessionId: string): Promise<void> {
  await mutateAndSave(async () => {
    await getDataDatabase().execute(
      'UPDATE sessions SET last_seen_at = ? WHERE id = ? AND revoked_at IS NULL',
      [new Date().toISOString(), sessionId],
    );
  });
}

export async function listIdentitySessions(userId: string): Promise<Array<{
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
}>> {
  return queryAll(
    `SELECT id, user_agent, ip_address, created_at, last_seen_at, expires_at
     FROM sessions WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ?
     ORDER BY last_seen_at DESC`,
    [userId, new Date().toISOString()],
  );
}

export async function listManagedIdentities(input: {
  page: number;
  pageSize: number;
  search: string;
  role?: IdentityRole;
}): Promise<{ users: Array<Omit<IdentityAccount, 'password_hash'>>; total: number }> {
  const filters: string[] = [];
  const values: (string | number)[] = [];
  if (input.role) {
    filters.push('r.name = ?');
    values.push(input.role);
  }
  if (input.search) {
    filters.push('(lower(u.email) LIKE ? OR lower(u.first_name || \' \' || u.last_name) LIKE ?)');
    const search = `%${input.search.trim().toLowerCase()}%`;
    values.push(search, search);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM users u
     JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id ${where}`,
    values,
  );
  const users = await queryAll<Omit<IdentityAccount, 'password_hash'>>(
    `${identitySelect.replace(', u.password_hash', '')} ${where}
     ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...values, input.pageSize, (input.page - 1) * input.pageSize],
  );
  return { users, total: Number(count?.total ?? 0) };
}

export async function updateManagedIdentity(input: {
  actorId: string;
  actorRole: IdentityRole;
  targetId: string;
  role?: IdentityRole;
  isActive?: boolean;
  ipAddress: string;
}): Promise<boolean> {
  return mutateAndSave(async () => {
    const current = await queryOne<{ role: IdentityRole; is_active: number }>(
      `SELECT r.name AS role, u.is_active FROM users u
       JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
       WHERE u.id = ?`,
      [input.targetId],
    );
    if (!current || input.actorId === input.targetId) return false;
    if (current.role === 'SUPER_ADMIN' && input.actorRole !== 'SUPER_ADMIN') return false;
    if (input.role === 'SUPER_ADMIN' && input.actorRole !== 'SUPER_ADMIN') return false;
    const now = new Date().toISOString();
    if (input.isActive !== undefined) {
      await getDataDatabase().execute(
        'UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?',
        [input.isActive ? 1 : 0, now, input.targetId],
      );
    }
    if (input.role && input.role !== current.role) {
      await getDataDatabase().execute(
        `UPDATE user_roles SET role_id = ?, assigned_at = ?, assigned_by = ?
         WHERE user_id = ?`,
        [`role_${input.role.toLowerCase()}`, now, input.actorId, input.targetId],
      );
    }
    if (input.isActive === false || (input.role && input.role !== current.role)) {
      await getDataDatabase().execute(
        `UPDATE sessions SET revoked_at = ?, revoke_reason = 'account_changed'
         WHERE user_id = ? AND revoked_at IS NULL`,
        [now, input.targetId],
      );
    }
    await insertAuditLog(input.actorId, 'identity.account.updated', 'user', input.targetId, {
      role: input.role ?? current.role,
      isActive: input.isActive ?? Boolean(current.is_active),
    }, input.ipAddress);
    return true;
  });
}

export async function revokeIdentitySession(
  userId: string,
  sessionId: string,
  ipAddress: string,
): Promise<boolean> {
  return mutateAndSave(async () => {
    const changed = await getDataDatabase().execute(
      `UPDATE sessions SET revoked_at = ?, revoke_reason = 'user_logout'
       WHERE id = ? AND user_id = ? AND revoked_at IS NULL`,
      [new Date().toISOString(), sessionId, userId],
    );
    if (changed) await insertAuditLog(userId, 'auth.session.revoked', 'session', sessionId, {}, ipAddress);
    return changed > 0;
  });
}

export async function revokeAllIdentitySessions(
  userId: string,
  exceptSessionId?: string,
  ipAddress = '',
): Promise<number> {
  return mutateAndSave(async () => {
    const now = new Date().toISOString();
    const changed = await getDataDatabase().execute(
      `UPDATE sessions SET revoked_at = ?, revoke_reason = 'logout_all'
       WHERE user_id = ? AND revoked_at IS NULL AND id != ?`,
      [now, userId, exceptSessionId ?? ''],
    );
    if (changed) await insertAuditLog(userId, 'auth.sessions.revoked_all', 'user', userId, { count: changed }, ipAddress);
    return changed;
  });
}

export async function createEmailVerificationToken(
  userId: string,
  tokenHash: string,
  expiresAt: string,
): Promise<void> {
  await mutateAndSave(async () => {
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      `UPDATE email_verification_tokens SET used_at = ?
       WHERE user_id = ? AND used_at IS NULL`,
      [now, userId],
    );
    await getDataDatabase().execute(
      `INSERT INTO email_verification_tokens (id, user_id, token_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), userId, tokenHash, now, expiresAt],
    );
  });
}

export async function verifyIdentityEmail(tokenHash: string, ipAddress: string): Promise<boolean> {
  return mutateAndSave(async () => {
    const now = new Date().toISOString();
    const token = await queryOne<{ id: string; user_id: string }>(
      `SELECT id, user_id FROM email_verification_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
      [tokenHash, now],
    );
    if (!token) return false;
    await getDataDatabase().execute(
      'UPDATE users SET email_verified = 1, email_verified_at = ?, updated_at = ? WHERE id = ?',
      [now, now, token.user_id],
    );
    await getDataDatabase().execute(
      'UPDATE email_verification_tokens SET used_at = ? WHERE id = ?',
      [now, token.id],
    );
    await insertAuditLog(token.user_id, 'auth.email.verified', 'user', token.user_id, {}, ipAddress);
    return true;
  });
}

export async function createPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: string,
): Promise<void> {
  await mutateAndSave(async () => {
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      `UPDATE password_reset_tokens SET used_at = ?
       WHERE user_id = ? AND used_at IS NULL`,
      [now, userId],
    );
    await getDataDatabase().execute(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), userId, tokenHash, now, expiresAt],
    );
  });
}

export async function resetIdentityPassword(
  tokenHash: string,
  passwordHash: string,
  ipAddress: string,
): Promise<boolean> {
  return mutateAndSave(async () => {
    const now = new Date().toISOString();
    const token = await queryOne<{ id: string; user_id: string }>(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
      [tokenHash, now],
    );
    if (!token) return false;
    await getDataDatabase().execute(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, now, token.user_id],
    );
    await getDataDatabase().execute(
      'UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL',
      [now, token.user_id],
    );
    await getDataDatabase().execute(
      `UPDATE sessions SET revoked_at = ?, revoke_reason = 'password_reset'
       WHERE user_id = ? AND revoked_at IS NULL`,
      [now, token.user_id],
    );
    await insertAuditLog(token.user_id, 'auth.password.reset', 'user', token.user_id, {}, ipAddress);
    return true;
  });
}

export async function changeIdentityPassword(
  userId: string,
  passwordHash: string,
  ipAddress: string,
): Promise<void> {
  await mutateAndSave(async () => {
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, now, userId],
    );
    await getDataDatabase().execute(
      `UPDATE sessions SET revoked_at = ?, revoke_reason = 'password_changed'
       WHERE user_id = ? AND revoked_at IS NULL`,
      [now, userId],
    );
    await getDataDatabase().execute(
      'UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL',
      [now, userId],
    );
    await insertAuditLog(userId, 'auth.password.changed', 'user', userId, {}, ipAddress);
  });
}

export async function findIdentityPasswordHash(userId: string): Promise<string | undefined> {
  const current = await queryOne<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = ? AND is_active = 1',
    [userId],
  );
  return current?.password_hash;
}

export async function updateIdentityLastLogin(userId: string, ipAddress: string): Promise<void> {
  await mutateAndSave(async () => {
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      'UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?',
      [now, now, userId],
    );
    await insertAuditLog(userId, 'auth.login.succeeded', 'user', userId, {}, ipAddress);
  });
}

export async function recordAuthenticationFailure(email: string, ipAddress: string): Promise<void> {
  await mutateAndSave(async () => {
    await insertAuditLog(null, 'auth.login.failed', 'identity', null, {
      email: email.trim().toLowerCase(),
    }, ipAddress);
  });
}

export async function insertAuditLog(
  actorUserId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  metadata: Record<string, string | number | boolean>,
  ipAddress = '',
): Promise<void> {
  await getDataDatabase().execute(
    `INSERT INTO audit_logs
     (id, actor_user_id, action, resource_type, resource_id, metadata_json, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(), actorUserId, action, resourceType, resourceId,
      JSON.stringify(metadata), ipAddress.slice(0, 64), new Date().toISOString(),
    ],
  );
}

export async function createStudentAccount(input: {
  email: string;
  fullName: string;
  passwordHash: string;
  phone: string;
  country: string;
  city: string;
  education: string;
  experience: string;
  interestedCourse: string;
  mode: string;
  careerGoal: string;
}): Promise<string> {
  return mutateAndSave(async () => {
    const id = randomUUID();
    const now = new Date().toISOString();
    const nameParts = input.fullName.trim().split(/\s+/);
    const firstName = nameParts.shift() ?? '';
    const lastName = nameParts.join(' ');
    await getDataDatabase().execute(
      `INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone, is_active,
        email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?)`,
      [
        id, input.email.trim().toLowerCase(), input.passwordHash, firstName,
        lastName, input.phone, now, now,
      ],
    );
    await getDataDatabase().execute(
      `INSERT INTO user_roles (user_id, role_id, assigned_at)
       VALUES (?, 'role_student', ?)`,
      [id, now],
    );
    await getDataDatabase().execute(
      `INSERT INTO student_profiles (
        user_id, country, city, education, experience, interested_course,
        learning_mode, career_goal, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, input.country, input.city, input.education, input.experience,
        input.interestedCourse, input.mode, input.careerGoal, now,
      ],
    );
    return id;
  });
}

export async function emailIsRegistered(email: string): Promise<boolean> {
  return Boolean(await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE lower(email) = ?
     UNION ALL SELECT id FROM admin_users WHERE lower(email) = ?
     UNION ALL SELECT id FROM student_users WHERE lower(email) = ?
     LIMIT 1`,
    [email.trim().toLowerCase(), email.trim().toLowerCase(), email.trim().toLowerCase()],
  ));
}

export async function createEnquiry(input: Omit<EnquiryRecord, 'id' | 'status' | 'assignedTo' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<EnquiryRecord> {
  return mutateAndSave(async () => {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await getDataDatabase().execute(
      `INSERT INTO enquiries (id, name, email, phone, course, message, status, source, assigned_to, created_at, updated_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'new', ?, '', ?, ?, '')`,
      [id, input.name, input.email, input.phone, input.course, input.message, input.source, createdAt, createdAt],
    );
    return {
      ...input,
      id,
      status: 'new',
      assignedTo: '',
      createdAt,
      updatedAt: createdAt,
      notes: '',
    };
  });
}

export async function listEnquiries(): Promise<EnquiryRecord[]> {
  return queryAll<EnquiryRecord>(
    `SELECT id, name, email, phone, course, message, status, source,
       assigned_to AS "assignedTo", created_at AS "createdAt", updated_at AS "updatedAt", notes,
       follow_up_date AS "followUpDate"
     FROM enquiries ORDER BY created_at DESC`,
  );
}

export async function updateEnquiry(
  id: string,
  input: Pick<EnquiryRecord, 'status' | 'assignedTo' | 'notes'> & { followUpDate: string | null },
): Promise<EnquiryRecord | undefined> {
  return mutateAndSave(async () => {
    const existing = await queryOne<{ id: string }>('SELECT id FROM enquiries WHERE id = ?', [id]);
    if (!existing) return undefined;
    const updatedAt = new Date().toISOString();
    await getDataDatabase().execute(
      `UPDATE enquiries SET status = ?, assigned_to = ?, follow_up_date = ?,
       notes = ?, updated_at = ? WHERE id = ?`,
      [input.status, input.assignedTo, input.followUpDate, input.notes, updatedAt, id],
    );
    return queryOne<EnquiryRecord>(
      `SELECT id, name, email, phone, course, message, status, source,
        assigned_to AS "assignedTo", created_at AS "createdAt", updated_at AS "updatedAt",
        notes, follow_up_date AS "followUpDate" FROM enquiries WHERE id = ?`,
      [id],
    );
  });
}

export async function subscribeNewsletter(email: string): Promise<boolean> {
  return mutateAndSave(async () => {
    const inserted = await getDataDatabase().execute(
      'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?) ON CONFLICT DO NOTHING',
      [email, new Date().toISOString()],
    );
    return inserted > 0;
  });
}

interface CmsRow {
  id: string;
  section: CmsSection;
  slug: string;
  content_json: string;
  published_json: string | null;
  status: CmsStatus;
  archived_from_status: Exclude<CmsStatus, 'archived'> | null;
  created_by: string;
  created_role: IdentityRole;
  updated_by: string;
  updated_role: IdentityRole;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
  draft_updated_at: string | null;
}

function mapCmsRow(row: CmsRow): CmsRecord {
  return {
    id: row.id,
    section: row.section,
    slug: row.slug,
    content: JSON.parse(row.content_json) as Record<string, unknown>,
    publishedContent: row.published_json === null
      ? null
      : JSON.parse(row.published_json) as Record<string, unknown>,
    status: row.status,
    hasDraft: row.status === 'draft' || row.draft_updated_at !== null,
    archivedFromStatus: row.archived_from_status,
    createdBy: row.created_by,
    createdRole: row.created_role,
    updatedBy: row.updated_by,
    updatedRole: row.updated_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    archivedAt: row.archived_at,
    draftUpdatedAt: row.draft_updated_at,
  };
}

const cmsSelect = `SELECT id, section, slug, content_json, published_json, status,
  archived_from_status, created_by, created_role, updated_by, updated_role,
  created_at, updated_at, published_at, archived_at, draft_updated_at FROM cms_records`;

async function syncCourseHierarchy(
  courseRecordId: string,
  content: Record<string, unknown>,
): Promise<void> {
  const now = new Date().toISOString();
  const currentModules = await queryAll<{ id: string; position: number }>(
    'SELECT id, position FROM course_modules WHERE course_record_id = ? ORDER BY position',
    [courseRecordId],
  );
  await getDataDatabase().execute(
    'UPDATE course_modules SET position = position + 10000 WHERE course_record_id = ?',
    [courseRecordId],
  );

  const modules = Array.isArray(content.modules) ? content.modules : [];
  const keptModuleIds = new Set<string>();
  for (const [modulePosition, moduleValue] of modules.entries()) {
    if (!moduleValue || typeof moduleValue !== 'object' || Array.isArray(moduleValue)) {
      throw new Error('COURSE_MODULE_INVALID');
    }
    const module = moduleValue as Record<string, unknown>;
    const title = typeof module.title === 'string' ? module.title.trim() : '';
    if (!title) throw new Error('COURSE_MODULE_TITLE_REQUIRED');
    const requestedId = typeof module.id === 'string' && module.id.trim()
      ? module.id.trim()
      : undefined;
    const existing = requestedId
      ? currentModules.find(item => item.id === `${courseRecordId}:module:${requestedId}`)
      : currentModules.find(item => item.position === modulePosition);
    const moduleId = existing?.id
      ?? `${courseRecordId}:module:${requestedId ?? `position-${modulePosition}`}`;
    keptModuleIds.add(moduleId);
    const moduleFields = [
      courseRecordId, title,
      typeof module.description === 'string' ? module.description : '',
      typeof module.duration === 'string' ? module.duration : '',
      modulePosition, now,
    ];
    if (existing) {
      await getDataDatabase().execute(
        `UPDATE course_modules SET course_record_id = ?, title = ?, description = ?,
          duration = ?, position = ?, updated_at = ? WHERE id = ?`,
        [...moduleFields, moduleId],
      );
    } else {
      await getDataDatabase().execute(
        `INSERT INTO course_modules
          (id, course_record_id, title, description, duration, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [moduleId, ...moduleFields.slice(0, 5), now, now],
      );
    }

    const currentLessons = await queryAll<{ id: string; position: number }>(
      'SELECT id, position FROM course_lessons WHERE module_id = ? ORDER BY position',
      [moduleId],
    );
    await getDataDatabase().execute(
      'UPDATE course_lessons SET position = position + 10000 WHERE module_id = ?',
      [moduleId],
    );
    const lessons = Array.isArray(module.lessons)
      ? module.lessons
      : Array.isArray(module.topics) ? module.topics : [];
    const keptLessonIds = new Set<string>();
    for (const [lessonPosition, lessonValue] of lessons.entries()) {
      const lesson = typeof lessonValue === 'string'
        ? { title: lessonValue }
        : lessonValue && typeof lessonValue === 'object' && !Array.isArray(lessonValue)
          ? lessonValue as Record<string, unknown>
          : undefined;
      const lessonTitle = typeof lesson?.title === 'string' ? lesson.title.trim() : '';
      if (!lessonTitle) throw new Error('COURSE_LESSON_TITLE_REQUIRED');
      const requestedLessonId = typeof lesson?.id === 'string' && lesson.id.trim()
        ? lesson.id.trim()
        : undefined;
      const existingLesson = requestedLessonId
        ? currentLessons.find(item => item.id === `${moduleId}:lesson:${requestedLessonId}`)
        : currentLessons.find(item => item.position === lessonPosition);
      const lessonId = existingLesson?.id
        ?? `${moduleId}:lesson:${requestedLessonId ?? `position-${lessonPosition}`}`;
      keptLessonIds.add(lessonId);
      const lessonFields = [
        moduleId,
        lessonTitle,
        typeof lesson?.summary === 'string' ? lesson.summary : '',
        JSON.stringify(lesson && lesson.content && typeof lesson.content === 'object' ? lesson.content : {}),
        typeof lesson?.videoUrl === 'string' ? lesson.videoUrl : '',
        typeof lesson?.documentUrl === 'string' ? lesson.documentUrl : '',
        typeof lesson?.externalUrl === 'string' ? lesson.externalUrl : '',
        lesson && Number.isInteger(lesson.durationMinutes) ? lesson.durationMinutes as number : null,
        lessonPosition,
        lesson?.isPreview === true ? 1 : 0,
        lesson && (lesson.status === 'published' || lesson.status === 'archived') ? lesson.status : 'draft',
        now,
      ];
      if (existingLesson) {
        await getDataDatabase().execute(
          `UPDATE course_lessons SET module_id = ?, title = ?, summary = ?, content_json = ?,
            video_url = ?, document_url = ?, external_url = ?, duration_minutes = ?,
            position = ?, is_preview = ?, status = ?, updated_at = ? WHERE id = ?`,
          [...lessonFields, lessonId],
        );
      } else {
        await getDataDatabase().execute(
          `INSERT INTO course_lessons (
            id, module_id, title, summary, content_json, video_url, document_url,
            external_url, duration_minutes, position, is_preview, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [lessonId, ...lessonFields.slice(0, 11), now, now],
        );
      }
    }
    for (const lesson of currentLessons) {
      if (!keptLessonIds.has(lesson.id)) {
        await getDataDatabase().execute('DELETE FROM course_lessons WHERE id = ?', [lesson.id]);
      }
    }
  }
  for (const module of currentModules) {
    if (!keptModuleIds.has(module.id)) {
      await getDataDatabase().execute('DELETE FROM course_modules WHERE id = ?', [module.id]);
    }
  }
}

export async function getCourseStructure(courseRecordId: string): Promise<Array<{
  id: string;
  title: string;
  description: string;
  duration: string;
  position: number;
  lessons: Array<{
    id: string;
    title: string;
    summary: string;
    content: Record<string, unknown>;
    videoUrl: string;
    documentUrl: string;
    externalUrl: string;
    durationMinutes: number | null;
    position: number;
    isPreview: boolean;
    status: 'draft' | 'published' | 'archived';
  }>;
}>> {
  const modules = await queryAll<{
    id: string;
    title: string;
    description: string;
    duration: string;
    position: number;
  }>(
    'SELECT id, title, description, duration, position FROM course_modules WHERE course_record_id = ? ORDER BY position',
    [courseRecordId],
  );
  return Promise.all(modules.map(async module => {
    const lessons = await queryAll<{
      id: string;
      title: string;
      summary: string;
      content_json: string;
      video_url: string;
      document_url: string;
      external_url: string;
      duration_minutes: number | null;
      position: number;
      is_preview: number;
      status: 'draft' | 'published' | 'archived';
    }>(
      `SELECT id, title, summary, content_json, video_url, document_url,
        external_url, duration_minutes, position, is_preview, status
       FROM course_lessons WHERE module_id = ? ORDER BY position`,
      [module.id],
    );
    return {
      ...module,
      lessons: lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        content: JSON.parse(lesson.content_json) as Record<string, unknown>,
        videoUrl: lesson.video_url,
        documentUrl: lesson.document_url,
        externalUrl: lesson.external_url,
        durationMinutes: lesson.duration_minutes,
        position: lesson.position,
        isPreview: lesson.is_preview === 1,
        status: lesson.status,
      })),
    };
  }));
}

export async function listCmsRecords(section: CmsSection, status?: CmsStatus): Promise<CmsRecord[]> {
  const statusFilter = status === 'draft'
    ? ` AND (status = 'draft' OR draft_updated_at IS NOT NULL)`
    : status ? ' AND status = ?' : '';
  const rows = await queryAll<CmsRow>(
    `${cmsSelect} WHERE section = ?${statusFilter} ORDER BY updated_at DESC`,
    status && status !== 'draft' ? [section, status] : [section],
  );
  return rows.map(mapCmsRow);
}

export async function findCmsRecord(section: CmsSection, slug: string): Promise<CmsRecord | undefined> {
  const row = await queryOne<CmsRow>(
    `${cmsSelect} WHERE section = ? AND slug = ?`,
    [section, slug],
  );
  return row ? mapCmsRow(row) : undefined;
}

export type PublicCmsRecord =
  | (Pick<CmsRecord, 'id' | 'section' | 'slug' | 'updatedAt' | 'publishedAt'> & {
    status: 'published';
    content: Record<string, unknown>;
  })
  | Pick<CmsRecord, 'id' | 'section' | 'slug' | 'updatedAt' | 'publishedAt' | 'status'>;

export async function listPublishedCmsRecords(section: CmsSection): Promise<PublicCmsRecord[]> {
  const rows = await queryAll<CmsRow>(
    `${cmsSelect} WHERE section = ? AND status IN ('published', 'archived') ORDER BY updated_at DESC`,
    [section],
  );
  const records: PublicCmsRecord[] = [];
  for (const row of rows) {
    if (row.status === 'published' && row.published_json !== null) {
      records.push({
        id: row.id,
        section: row.section,
        slug: row.slug,
        status: 'published',
        content: JSON.parse(row.published_json) as Record<string, unknown>,
        updatedAt: row.published_at ?? row.updated_at,
        publishedAt: row.published_at,
      });
    } else if (row.status === 'archived' && row.published_json !== null) {
      records.push({
        id: row.id,
        section: row.section,
        slug: row.slug,
        status: 'archived',
        updatedAt: row.archived_at ?? row.updated_at,
        publishedAt: row.published_at,
      });
    }
  }
  return records;
}

export async function createCmsRecord(
  section: CmsSection,
  slug: string,
  content: Record<string, unknown>,
  actor: CmsActor,
): Promise<CmsRecord> {
  return mutateAndSave(async () => {
    const id = randomUUID();
    const now = new Date().toISOString();
    const inserted = await getDataDatabase().execute(
      `INSERT INTO cms_records (
        id, section, slug, content_json, status, created_by, created_role,
        updated_by, updated_role, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?)
      ON CONFLICT (section, slug) DO NOTHING`,
      [id, section, slug, JSON.stringify(content), actor.id, actor.role, actor.id, actor.role, now, now],
    );
    if (inserted === 0) throw new Error('CMS_SLUG_EXISTS');
    const record = await findCmsRecord(section, slug);
    if (!record) throw new Error('Created CMS record could not be loaded.');
    if (section === 'courses') await syncCourseHierarchy(id, content);
    await insertAuditLog(actor.id, 'cms.record.created', 'cms_record', id, { section, slug }, actor.ipAddress);
    return record;
  });
}

export async function updateCmsRecord(
  section: CmsSection,
  slug: string,
  content: Record<string, unknown>,
  actor: CmsActor,
): Promise<CmsRecord | undefined> {
  return mutateAndSave(async () => {
    const current = await findCmsRecord(section, slug);
    if (!current || current.status === 'archived') return undefined;
    const now = new Date().toISOString();
    const hasDraft = JSON.stringify(content) !== JSON.stringify(current.publishedContent);
    await getDataDatabase().execute(
      `UPDATE cms_records SET content_json = ?, updated_by = ?, updated_role = ?,
        updated_at = ?, draft_updated_at = ? WHERE section = ? AND slug = ?`,
      [JSON.stringify(content), actor.id, actor.role, now, current.status === 'published' && hasDraft ? now : null, section, slug],
    );
    if (section === 'courses') await syncCourseHierarchy(current.id, content);
    await insertAuditLog(actor.id, 'cms.record.updated', 'cms_record', current.id, { section, slug }, actor.ipAddress);
    return findCmsRecord(section, slug);
  });
}

export async function upsertCmsRecord(
  section: CmsSection,
  slug: string,
  content: Record<string, unknown>,
  actor: CmsActor,
): Promise<{ record: CmsRecord; created: boolean } | undefined> {
  return mutateAndSave(async () => {
    let current = await findCmsRecord(section, slug);
    if (!current) {
      const id = randomUUID();
      const now = new Date().toISOString();
      const inserted = await getDataDatabase().execute(
        `INSERT INTO cms_records (
          id, section, slug, content_json, status, created_by, created_role,
          updated_by, updated_role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?)
        ON CONFLICT (section, slug) DO NOTHING`,
        [id, section, slug, JSON.stringify(content), actor.id, actor.role, actor.id, actor.role, now, now],
      );
      current = await findCmsRecord(section, slug);
      if (!current) throw new Error('CMS record could not be loaded after upsert.');
      if (inserted > 0) {
        if (section === 'courses') await syncCourseHierarchy(current.id, content);
        await insertAuditLog(actor.id, 'cms.record.created', 'cms_record', current.id, { section, slug }, actor.ipAddress);
        return { record: current, created: true };
      }
    }
    if (current.status === 'archived') return undefined;
    const now = new Date().toISOString();
    const hasDraft = JSON.stringify(content) !== JSON.stringify(current.publishedContent);
    await getDataDatabase().execute(
      `UPDATE cms_records SET content_json = ?, updated_by = ?, updated_role = ?,
        updated_at = ?, draft_updated_at = ? WHERE section = ? AND slug = ?`,
      [JSON.stringify(content), actor.id, actor.role, now, current.status === 'published' && hasDraft ? now : null, section, slug],
    );
    if (section === 'courses') await syncCourseHierarchy(current.id, content);
    await insertAuditLog(actor.id, 'cms.record.updated', 'cms_record', current.id, { section, slug }, actor.ipAddress);
    const record = await findCmsRecord(section, slug);
    if (!record) throw new Error('Updated CMS record could not be loaded.');
    return { record, created: false };
  });
}

export async function publishCmsRecord(
  section: CmsSection,
  slug: string,
  actor: CmsActor,
): Promise<CmsRecord | undefined> {
  return mutateAndSave(async () => {
    const current = await findCmsRecord(section, slug);
    if (!current || current.status === 'archived') return undefined;
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      `UPDATE cms_records SET published_json = content_json, status = 'published',
        archived_from_status = NULL, updated_by = ?, updated_role = ?, updated_at = ?,
        published_at = ?, archived_at = NULL, draft_updated_at = NULL
       WHERE section = ? AND slug = ?`,
      [actor.id, actor.role, now, now, section, slug],
    );
    await insertAuditLog(actor.id, 'cms.record.published', 'cms_record', current.id, { section, slug }, actor.ipAddress);
    return findCmsRecord(section, slug);
  });
}

export async function unpublishCmsRecord(
  section: CmsSection,
  slug: string,
  actor: CmsActor,
): Promise<CmsRecord | undefined> {
  return mutateAndSave(async () => {
    const current = await findCmsRecord(section, slug);
    if (!current || current.status !== 'published') return undefined;
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      `UPDATE cms_records SET published_json = NULL, status = 'draft',
        archived_from_status = NULL, updated_by = ?, updated_role = ?,
        updated_at = ?, draft_updated_at = NULL
       WHERE section = ? AND slug = ?`,
      [actor.id, actor.role, now, section, slug],
    );
    await insertAuditLog(actor.id, 'cms.record.unpublished', 'cms_record', current.id, { section, slug }, actor.ipAddress);
    return findCmsRecord(section, slug);
  });
}

export async function archiveCmsRecord(
  section: CmsSection,
  slug: string,
  actor: CmsActor,
): Promise<CmsRecord | undefined> {
  return mutateAndSave(async () => {
    const current = await findCmsRecord(section, slug);
    if (!current) return undefined;
    if (current.status === 'archived') return current;
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      `UPDATE cms_records SET archived_from_status = status, status = 'archived',
        updated_by = ?, updated_role = ?, updated_at = ?, archived_at = ?
       WHERE section = ? AND slug = ?`,
      [actor.id, actor.role, now, now, section, slug],
    );
    await insertAuditLog(actor.id, 'cms.record.archived', 'cms_record', current.id, { section, slug }, actor.ipAddress);
    return findCmsRecord(section, slug);
  });
}

export async function restoreCmsRecord(
  section: CmsSection,
  slug: string,
  actor: CmsActor,
): Promise<CmsRecord | undefined> {
  return mutateAndSave(async () => {
    const current = await findCmsRecord(section, slug);
    if (!current || current.status !== 'archived') return undefined;
    const restoredStatus = current.archivedFromStatus ?? 'draft';
    const now = new Date().toISOString();
    await getDataDatabase().execute(
      `UPDATE cms_records SET status = ?, archived_from_status = NULL,
        updated_by = ?, updated_role = ?, updated_at = ?, archived_at = NULL
       WHERE section = ? AND slug = ?`,
      [restoredStatus, actor.id, actor.role, now, section, slug],
    );
    await insertAuditLog(actor.id, 'cms.record.restored', 'cms_record', current.id, { section, slug }, actor.ipAddress);
    return findCmsRecord(section, slug);
  });
}

export async function deleteCmsRecord(section: CmsSection, slug: string, actor: CmsActor): Promise<boolean> {
  return mutateAndSave(async () => {
    const current = await findCmsRecord(section, slug);
    if (!current) return false;
    await getDataDatabase().execute('DELETE FROM cms_records WHERE section = ? AND slug = ?', [section, slug]);
    await insertAuditLog(actor.id, 'cms.record.deleted', 'cms_record', current.id, { section, slug }, actor.ipAddress);
    return true;
  });
}

export async function initializeDatabase(): Promise<void> {
  await initializeDataDatabase();
  await runMigrations(getDataDatabase());

  for (const account of config.accounts) {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM admin_users WHERE lower(email) = ?',
      [account.email],
    );
    if (existing) continue;

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(account.password, 12);
    await mutateAndSave(async () => {
      const now = new Date().toISOString();
      await getDataDatabase().execute(
        `INSERT INTO admin_users (id, email, password_hash, role, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, account.email, passwordHash, account.role, now],
      );
      await getDataDatabase().execute(
        `INSERT INTO users (
          id, email, password_hash, first_name, is_active, email_verified,
          email_verified_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 1, 1, ?, ?, ?)`,
        [id, account.email, passwordHash, account.email.split('@')[0], now, now, now],
      );
      await getDataDatabase().execute(
        `INSERT INTO user_roles (user_id, role_id, assigned_at)
         VALUES (?, ?, ?)`,
        [id, `role_${account.role.toLowerCase()}`, now],
      );
    });
  }
}

export { closeDataDatabase };
