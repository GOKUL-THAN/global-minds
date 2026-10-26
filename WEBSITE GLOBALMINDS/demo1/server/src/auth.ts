import { createHash, randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  createIdentitySession,
  getAuthenticatedSession,
  touchIdentitySession,
  type AuthenticatedSession,
} from './db.js';
import { config } from './config.js';

export const sessionCookieName = 'gma_session';
export const sessionCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict' as const,
  path: '/api',
  maxAge: config.sessionDurationSeconds * 1000,
};

export type AuthenticatedUser = AuthenticatedSession;

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthenticatedUser;
    authSessionId?: string;
  }
}

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function createOneTimeSecret(): string {
  return randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '');
}

export async function createSessionToken(
  userId: string,
  userAgent: string,
  ipAddress: string,
): Promise<{ token: string; sessionId: string }> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + config.sessionDurationSeconds * 1000).toISOString();
  const token = jwt.sign({ sid: sessionId }, config.jwtSecret, {
    subject: userId,
    issuer: 'global-academy-auth',
    audience: 'global-academy',
    expiresIn: config.sessionDurationSeconds,
  });
  await createIdentitySession({
    id: sessionId,
    userId,
    tokenHash: hashSecret(token),
    userAgent,
    ipAddress,
    expiresAt,
  });
  return { token, sessionId };
}

function sessionFromRequest(req: Request): string {
  const token = req.cookies?.[sessionCookieName];
  if (typeof token !== 'string') throw new Error('SESSION_REQUIRED');
  const claims = jwt.verify(token, config.jwtSecret, {
    issuer: 'global-academy-auth',
    audience: 'global-academy',
  });
  if (typeof claims === 'string' || !claims.sub || typeof claims.sid !== 'string') {
    throw new Error('SESSION_INVALID');
  }
  req.authSessionId = claims.sid;
  return token;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let token: string;
  try {
    token = sessionFromRequest(req);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError
      || error instanceof Error && ['SESSION_REQUIRED', 'SESSION_INVALID'].includes(error.message)) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      return;
    }
    next(error);
    return;
  }

  try {
    const sessionId = req.authSessionId;
    if (!sessionId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      return;
    }
    const user = await getAuthenticatedSession(sessionId, hashSecret(token));
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session is invalid, expired, or revoked.' } });
      return;
    }
    req.auth = user;
    await touchIdentitySession(sessionId);
    next();
  } catch (error) {
    next(error);
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      return;
    }
    if (!req.auth.permissions.includes(permission)) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } });
      return;
    }
    next();
  };
}

export function currentIpAddress(req: Request): string {
  return req.ip || req.socket.remoteAddress || '';
}
