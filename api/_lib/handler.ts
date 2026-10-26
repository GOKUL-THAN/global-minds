/**
 * Shared request/response utilities for Vercel serverless functions.
 *
 * Vercel functions receive a standard Node IncomingMessage / ServerResponse.
 * This module adds cookie parsing, JSON body reading, CORS headers, and a
 * thin auth layer that mirrors the Express middleware in server/src/auth.ts.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ensureDb, getDataDatabase } from './init.js';
import {
  getAuthenticatedSession,
  touchIdentitySession,
  listIdentityPermissions,
} from '../../server/src/db.js';

// ── env ───────────────────────────────────────────────────────────────────────
function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const SESSION_COOKIE = 'gma_session';

function cookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict' as const,
    path: '/api',
    maxAge: 2 * 60 * 60, // 2 hours in seconds
  };
}

// ── cookie helpers ────────────────────────────────────────────────────────────
export function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie ?? '';
  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const [key, ...rest] = part.split('=');
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join('=').trim());
  }
  return cookies;
}

export function setCookie(res: VercelResponse, name: string, value: string, options: {
  httpOnly?: boolean; secure?: boolean; sameSite?: string;
  path?: string; maxAge?: number;
}): void {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  const existing = res.getHeader('Set-Cookie');
  const prev = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
  res.setHeader('Set-Cookie', [...prev, parts.join('; ')]);
}

export function clearCookie(res: VercelResponse, name: string, path = '/api'): void {
  setCookie(res, name, '', { httpOnly: true, path, maxAge: 0 });
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = new Set<string>();
function buildAllowedOrigins(): void {
  const appOrigin = process.env.APP_ORIGIN?.trim().replace(/\/$/, '');
  if (appOrigin) allowedOrigins.add(appOrigin);
  // Always allow the Vercel deployment URL and localhost dev
  for (const o of [
    'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173',
  ]) allowedOrigins.add(o);
  // Allow the Vercel URL itself if set
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) allowedOrigins.add(`https://${vercelUrl}`);
}
buildAllowedOrigins();

export function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin?.replace(/\/$/, '') ?? '';
  const allowed = allowedOrigins.has(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false; // caller should return
  }
  return true;
}

// ── auth ──────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: number;
  email_verified: number;
  created_at: string;
  last_login_at: string | null;
  country: string;
  city: string;
  education: string;
  experience: string;
  permissions: string[];
  sessionId: string;
}

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export async function getAuthUser(req: VercelRequest): Promise<AuthUser | null> {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  try {
    const jwtSecret = requiredEnv('JWT_SECRET');
    const claims = jwt.verify(token, jwtSecret, {
      issuer: 'global-academy-auth',
      audience: 'global-academy',
    });
    if (typeof claims === 'string' || !claims.sub || typeof claims.sid !== 'string') return null;
    const user = await getAuthenticatedSession(claims.sid, hashSecret(token));
    if (!user) return null;
    await touchIdentitySession(claims.sid);
    return { ...user, sessionId: claims.sid };
  } catch {
    return null;
  }
}

export function requireAuth(user: AuthUser | null, res: VercelResponse): user is AuthUser {
  if (!user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
    return false;
  }
  return true;
}

export function requirePerm(user: AuthUser | null, permission: string, res: VercelResponse): user is AuthUser {
  if (!requireAuth(user, res)) return false;
  if (!user.permissions.includes(permission)) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } });
    return false;
  }
  return true;
}

// ── body helpers ──────────────────────────────────────────────────────────────
export function body(req: VercelRequest): Record<string, unknown> {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return {};
  return req.body as Record<string, unknown>;
}

export function str(obj: Record<string, unknown>, key: string, max = 500): string {
  return typeof obj[key] === 'string' ? (obj[key] as string).trim().slice(0, max) : '';
}

// ── IP ────────────────────────────────────────────────────────────────────────
export function getIp(req: VercelRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    ''
  ).slice(0, 64);
}

// ── cookie helpers for set-session / clear-session ────────────────────────────
export function setSessionCookie(res: VercelResponse, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  setCookie(res, SESSION_COOKIE, token, cookieOptions(isProd));
}

export function clearSessionCookie(res: VercelResponse): void {
  clearCookie(res, SESSION_COOKIE, '/api');
}

// ── error handler ─────────────────────────────────────────────────────────────
export function handleError(err: unknown, res: VercelResponse): void {
  console.error('[api] unhandled error:', err);
  if (res.headersSent) return;
  res.status(500).json({ success: false, message: 'An internal server error occurred.' });
}

// ── wrapper ───────────────────────────────────────────────────────────────────
export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export function handle(fn: Handler) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    res.setHeader('Cache-Control', 'no-store');
    const proceed = setCorsHeaders(req, res);
    if (!proceed) return;
    try {
      await ensureDb();
      await fn(req, res);
    } catch (err) {
      handleError(err, res);
    }
  };
}
